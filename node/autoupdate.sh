while :
do
  node makedata.js
  node covid19fast.mjs
  git add ../data
  git commit -m 'update data'
  git push
  echo 'sleep 600'
  sleep 600
done
