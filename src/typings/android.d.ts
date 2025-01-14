declare namespace com {
    export namespace nativescript {
        export namespace text {
            export class CustomTypefaceSpan extends globalAndroid.text.style.TypefaceSpan {
                constructor(family: string, typeface: globalAndroid.graphics.Typeface);
            }
            export class CustomBackgroundSpan extends globalAndroid.text.style.ReplacementSpan {
                constructor(radius: number, fillColor: number, strokeColor: number, strokeWidth: number);
            }
            export class BaselineAdjustedSpan extends globalAndroid.text.style.CharacterStyle {
                constructor(fontSize: number, align: string, maxFontSize: number);
            }
            export class HeightSpan extends globalAndroid.text.style.CharacterStyle {
                constructor(size: number);
            }
            export class URLSpanNoUnderline extends globalAndroid.text.style.URLSpan {
                constructor(url: string, showUnderline: boolean);
            }

            export class Font {
                static stringBuilderFromHtmlString(context: globalAndroid.content.Context, fontPath: string, parentFontFamily: string, text: string): globalAndroid.text.SpannableStringBuilder;
                static stringBuilderFromFormattedString(context: globalAndroid.content.Context, fontPath: string, parentFontFamily: string, nativeString: string): any;
                static createTypeface(
                    context: globalAndroid.content.Context,
                    fontFolder: string,
                    fontFamily: string,
                    fontWeight: string,
                    isBold: boolean,
                    isItalic: boolean
                ): globalAndroid.graphics.Typeface;
            }
        }
    }
}
