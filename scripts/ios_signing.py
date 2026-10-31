"""Create an App Store distribution certificate + provisioning profile with the
App Store Connect API for one CI build. The certificate is kept until the next
run (so the upload to App Store Connect is not affected) and revoked then.

  python scripts/ios_signing.py setup  <outdir>   -> writes dist.p12, profile.mobileprovision, state.json
  python scripts/ios_signing.py cleanup <outdir>  -> deletes the provisioning profile

Apps already uploaded to TestFlight / the App Store are re-signed by Apple, so
revoking the certificate after the build does not affect them.
Env: ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER_ID, BUNDLE_ID
"""
import base64, json, os, secrets, subprocess, sys, time
import jwt, requests

API = 'https://api.appstoreconnect.apple.com/v1'


def token():
    key = open(os.environ['ASC_KEY_PATH']).read()
    now = int(time.time())
    return jwt.encode({'iss': os.environ['ASC_ISSUER_ID'], 'iat': now, 'exp': now + 1100, 'aud': 'appstoreconnect-v1'},
                      key, algorithm='ES256', headers={'kid': os.environ['ASC_KEY_ID'], 'typ': 'JWT'})


def call(method, path, body=None, ok=(200, 201, 204)):
    r = requests.request(method, API + path, json=body, headers={'Authorization': 'Bearer ' + token()}, timeout=60)
    if r.status_code not in ok:
        sys.exit(f'Apple API {method} {path} -> {r.status_code}\n{r.text}')
    return r.json() if r.content else {}


def run(*cmd):
    subprocess.run(cmd, check=True, capture_output=True)


def setup(out):
    bundle = os.environ['BUNDLE_ID']
    # 1. the bundle ID record, with Push Notifications on (expo-notifications adds that entitlement)
    found = call('GET', f'/bundleIds?filter[identifier]={bundle}&limit=5')['data']
    found = [b for b in found if b['attributes']['identifier'] == bundle]
    if not found:
        sys.exit(f'Bundle ID {bundle} is not registered at developer.apple.com')
    bid = found[0]['id']
    caps = call('GET', f'/bundleIds/{bid}/bundleIdCapabilities')['data']
    if not any(c['attributes']['capabilityType'] == 'PUSH_NOTIFICATIONS' for c in caps):
        call('POST', '/bundleIdCapabilities', {'data': {'type': 'bundleIdCapabilities',
             'attributes': {'capabilityType': 'PUSH_NOTIFICATIONS'},
             'relationships': {'bundleId': {'data': {'type': 'bundleIds', 'id': bid}}}}})
        print('Enabled Push Notifications on', bundle)

    # 2. stay under Apple's limit on distribution certificates: revoke the previous run's certificate
    certs = call('GET', '/certificates?filter[certificateType]=DISTRIBUTION,IOS_DISTRIBUTION&limit=50')['data']
    for c in certs:
        call('DELETE', f"/certificates/{c['id']}")
        print('Revoked old certificate', c['id'])

    # 3. new key + CSR -> certificate
    key, csr, pem = f'{out}/dist.key', f'{out}/dist.csr', f'{out}/dist.pem'
    run('openssl', 'genrsa', '-out', key, '2048')
    run('openssl', 'req', '-new', '-key', key, '-out', csr, '-subj', '/CN=Adwamuha CI/O=Adwamuha/C=MA')
    csr_text = open(csr).read()
    cert = call('POST', '/certificates', {'data': {'type': 'certificates', 'attributes': {
        'certificateType': 'DISTRIBUTION', 'csrContent': csr_text}}})['data']
    der = base64.b64decode(cert['attributes']['certificateContent'])
    open(f'{out}/dist.cer', 'wb').write(der)
    run('openssl', 'x509', '-inform', 'DER', '-in', f'{out}/dist.cer', '-out', pem)
    password = secrets.token_urlsafe(18)
    run('openssl', 'pkcs12', '-export', '-inkey', key, '-in', pem, '-out', f'{out}/dist.p12', '-passout', 'pass:' + password,
        '-keypbe', 'PBE-SHA1-3DES', '-certpbe', 'PBE-SHA1-3DES', '-macalg', 'sha1')
    print('Created certificate', cert['id'])

    # 4. App Store provisioning profile for this bundle + certificate
    prof = call('POST', '/profiles', {'data': {'type': 'profiles',
        'attributes': {'name': f'Adwamuha CI {int(time.time())}', 'profileType': 'IOS_APP_STORE'},
        'relationships': {'bundleId': {'data': {'type': 'bundleIds', 'id': bid}},
                          'certificates': {'data': [{'type': 'certificates', 'id': cert['id']}]}}}})['data']
    open(f'{out}/profile.mobileprovision', 'wb').write(base64.b64decode(prof['attributes']['profileContent']))
    print('Created profile', prof['id'])

    json.dump({'certId': cert['id'], 'profileId': prof['id'], 'password': password}, open(f'{out}/state.json', 'w'))
    json.dump({'ios': {'provisioningProfilePath': f'{out}/profile.mobileprovision',
                       'distributionCertificate': {'path': f'{out}/dist.p12', 'password': password}}},
              open('credentials.json', 'w'), indent=2)


def cleanup(out):
    try:
        st = json.load(open(f'{out}/state.json'))
    except FileNotFoundError:
        return
    call('DELETE', f"/profiles/{st['profileId']}", ok=(204, 404))
    print('Removed the CI provisioning profile')


if __name__ == '__main__':
    {'setup': setup, 'cleanup': cleanup}[sys.argv[1]](sys.argv[2])
