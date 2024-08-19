Fonts used:

- Noto Sans Regular
- Noto Sans Bold

To reduce file size, a subset of the fonts above are generated using
[fonttools](https://fonttools.readthedocs.io/en/latest/subset/index.html).

```shell
python3 -m venv venv
source venv/bin/activate
pip install 'fonttools[woff]'
```

Download the font from https://fonts.google.com/noto/specimen/Noto+Sans,
then perform the following:

```shell
unzip Noto_Sans.zip
fonttools subset static/NotoSans-Regular.ttf --unicodes="0-ff" --flavor=woff2 --output-file=NotoSans-Regular.woff2
fonttools subset static/NotoSans-Bold.ttf --unicodes="0-ff" --flavor=woff2 --output-file=NotoSans-Bold.woff2
# Optional: list the Unicode character ranges in the font file
fc-query --format='%{charset}\n' NotoSans-Regular.woff2
# Move the fonts to the assets directory
mv NotoSans-Regular.woff2 NotoSans-Bold.woff2 ../src/assets/
```
