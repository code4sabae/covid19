while :
do
  node makedata.js
  node covid19wakayama.mjs
  node covid19hyogo.mjs
  node covid19fast.js
  git add ../data
  git commit -m 'update data'
  git push
  echo 'sleep 600'
  sleep 600
done
