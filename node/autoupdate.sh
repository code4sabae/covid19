#while :
#do
  node makedata.js
  node covid19fast.mjs
  deno run -A covid19forecast.deno.js
  sh update_covid19vaccine.sh
  sh update_fdma.sh
  node covid19japan.mjs
  node covid19mhlw.mjs
  node covid19trend.mjs
  node makeogp.mjs
  
#  git add ../data
#  git commit -m 'update data'
#  git push
#  echo 'sleep 600'
#  sleep 600
#done
