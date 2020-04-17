while :
do
  node makedata.js
  node covid19fast.js
  git add ../data
  git commit -m 'update data'
  git push
  echo 'sleep 180'
  sleep 180
done
