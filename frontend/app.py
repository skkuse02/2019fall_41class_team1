from flask import Flask, render_template, request, redirect, session
import json
import requests
from werkzeug.utils import secure_filename
from os.path import join, dirname, realpath
import os

app = Flask(__name__)
app.secret_key = 'Nharu7'

URL = 'http://localhost:3000'


@app.route('/login')
def login():
    session['uid'] = 0
    return redirect('/main')


@app.route('/main')
def main():
    return render_template('main.html')


@app.route('/image')
def image():
    return render_template('image.html')


@app.route('/upload', methods=['POST'])
def upload():
    image = request.files['image']
    filename = 'static/image/' + secure_filename(image.filename)
    filename = join(dirname(realpath(__file__)), filename)
    image.save(filename)

    url = URL + '/food/image'

    files = {'image': open(filename, 'rb')}

    r = requests.post(url, files=files)

    data = r.json()

    if data['result'] is True:
        url = URL + '/food/data/' + str(data['id'])
        r = requests.get(url)
        cdata = r.json()
        return render_template('upload.html', url=URL, data=data, cdata=cdata)
    else:
        return render_template('upload.html', url=URL, data=data)


@app.route('/upload/final')
def uploadFinal():
    id = request.args.get('id')
    uid = session['uid']

    url = URL + '/food/upload'

    r = requests.post(url, data={
        'id': id,
        'uid': uid
    })

    return redirect('/main')


@app.route('/recommendation')
def recommendation():
    url = URL + '/user/' + str(session['uid'])
    r = requests.get(url)
    udata = r.json()
    udata = udata['data']

    udata['calories'] /= 2300
    udata['fiber'] /= 25
    udata['calcium'] /= 750
    udata['iron'] /= 12
    udata['sodium'] /= 1500
    udata['vitaminA'] /= 800

    url = URL + '/food/' + str(session['uid'])
    r = requests.get(url)
    fdata = r.json()
    fdata = fdata['data']

    url = URL + '/recommendation/' + str(session['uid'])
    r = requests.get(url)
    rdata = r.json()

    return render_template('recommendation.html', url = URL, udata=udata, fdata=fdata, rdata=rdata)


@app.route('/product')
def product():
    fid = request.args.get('id')

    url = URL + '/product/list/' + str(fid)

    r = requests.get(url)
    data = r.json()

    return render_template('product.html', data=data['data'])


@app.route('/order')
def order():
    uid = session['uid']
    pid = request.args.get('id')

    url = URL + '/product/order/'

    r = requests.post(url, data={
        'uid': uid,
        'pid': pid
    })

    return redirect('/main')


@app.route('/order/list')
def orderlist():
    uid = session['uid']

    url = URL + '/product/order/' + str(uid)

    r = requests.get(url)
    data = r.json()

    print(data)

    return render_template('order.html', data=data['data'])


@app.route('/')
def first():
    return render_template('first.html')


@app.route('/oauth', methods=['GET'])
def oauth():
    code = request.args.get('code')

    url = 'https://kauth.kakao.com/oauth/token'

    payload = 'grant_type=authorization_code&client_id=a484689da33aa21c3d84caf1bed71686&redirect_uri=http://jhrabbit.iptime.org:15000/oauth&code='+code

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-chche'
    }

    r = requests.post(url, data=payload, headers=headers)
    data = r.json()
    access_token = data['access_token']

    url = "https://kapi.kakao.com/v1/user/signup"

    headers.update({
        'Authorization': "Bearer " +str(access_token)
    })

    r = requests.post(url, headers=headers)
    data = r.json()

    url = "https://kapi.kakao.com/v1/user/me"

    r = requests.post(url, headers=headers)
    data = r.json()

    session['uid'] = data['id']
    session['name'] = data['properties']['nickname']

    url = URL + '/user'

    r = requests.get(url+'/'+str(session['uid']))
    data = r.json()

    if data['result'] is False:
        r = requests.post(url, data={
            'id': session['uid'],
            'name': session['name']
        })

    return redirect('/main')


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
