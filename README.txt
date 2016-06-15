# Clarify API docker wrapper

This docker image handles the Auth token and then passes all requests on to the API.

It also does some basic normalization.


```shell
$ docker build -t clarifyai/1 .
$ docker run --name clarify -e CLIENT_ID=API_KEY -e CLIENT_SECRET=SECRET -d clarifyai/1

```

```shell
# any command from clarifyai should work against this wrapper

$ curl "http://localhost:7313/tag/" \
  -X POST --data-urlencode "url=https://samples.clarifai.com/metro-north.jpg"

$ curl "http://localhost:7313/color/" \
  -X POST --data-urlencode "url=https://samples.clarifai.com/metro-north.jpg"  \
  --data-urlencode "url=https://samples.clarifai.com/wedding.jpg" \
  --data-urlencode "url=http://i.imgur.com/w7UUjn1.jpg"

```
