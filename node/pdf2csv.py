import camelot
import sys

srcpdf = sys.argv[1]

i = 1
while 1:
  print("parsing... %d page" % i)
  try:
    tables = camelot.read_pdf(srcpdf, pages=str(i), split_text=True, strip_text="\n") #, line_scale=40)
    print("done!")
    df = tables[0].df
    dstcsv = "%s-%d.csv" % (srcpdf, i)
    df.to_csv(dstcsv)
    print(dstcsv)
  except:
    print("err! can't write %s-%d.csv" % (srcpdf, i))
  i = i + 1
  if i > 100:
    break

