#!/usr/bin/env python3

#
# Cited from [【PDFMiner】PDFからテキストの抽出 \- Qiita](https://qiita.com/mczkzk/items/894110558fb890c930b5)
# LTTextBox でなく LTTextLine 単位でとるよう改変
#

import sys

from pdfminer.converter import PDFPageAggregator
from pdfminer.layout import LAParams, LTContainer, LTTextBox, LTTextLine
from pdfminer.pdfinterp import PDFPageInterpreter, PDFResourceManager
from pdfminer.pdfpage import PDFPage


def find_textboxes_recursively(layout_obj):
    """
    再帰的にテキストライン（LTTextLine）を探して、テキストボックスのリストを取得する。
    """
    # LTTextBoxを継承するオブジェクトの場合は1要素のリストを返す。
    if isinstance(layout_obj, LTTextLine):
        return [layout_obj]

    # LTContainerを継承するオブジェクトは子要素を含むので、再帰的に探す。
    if isinstance(layout_obj, LTContainer):
        boxes = []
        for child in layout_obj:
            boxes.extend(find_textboxes_recursively(child))

        return boxes

    return []  # その他の場合は空リストを返す。

# Layout Analysisのパラメーターを設定。縦書きの検出を有効にする。
laparams = LAParams(detect_vertical=True)

# 共有のリソースを管理するリソースマネージャーを作成。
resource_manager = PDFResourceManager()

# ページを集めるPageAggregatorオブジェクトを作成。
device = PDFPageAggregator(resource_manager, laparams=laparams)

# Interpreterオブジェクトを作成。
interpreter = PDFPageInterpreter(resource_manager, device)

# 出力用のテキストファイル
# output_txt = open('output.txt', 'w')


def print_and_write(txt):
    print(txt)
    # output_txt.write(txt)
    # output_txt.write('\n')


with open(sys.argv[1], 'rb') as f:
    # PDFPage.get_pages()にファイルオブジェクトを指定して、PDFPageオブジェクトを順に取得する。
    # 時間がかかるファイルは、キーワード引数pagenosで処理するページ番号（0始まり）のリストを指定するとよい。
    for page in PDFPage.get_pages(f):
        print_and_write('\n====== ページ区切り ======\n')
        interpreter.process_page(page)  # ページを処理する。
        layout = device.get_result()  # LTPageオブジェクトを取得。

        # ページ内のテキストボックスのリストを取得する。
        boxes = find_textboxes_recursively(layout)

        # テキストボックスの左上の座標の順でテキストボックスをソートする。
        # y1（Y座標の値）は上に行くほど大きくなるので、正負を反転させている。
        boxes.sort(key=lambda b: (-b.y1, b.x0))

        for box in boxes:
            print_and_write('-' * 10)  # 読みやすいよう区切り線を表示する。
            print_and_write(box.get_text().strip())  # テキストボックス内のテキストを表示する。
            print_and_write(f"{box.x0}, {box.y0} - {box.x1}, {box.y1}")  # テキストボックスの座標を表示する。

# output_txt.close()

