import { Application, Color, FormattedString, Span, backgroundColorProperty, knownFolders, path, profile } from '@nativescript/core';
import { Font, FontWeight } from '@nativescript/core/ui/styling/font';
import { TextAlignment, getTransformedText, textDecorationProperty } from '@nativescript/core/ui/text-base';
import { LightFormattedString, computeBaseLineOffset } from './index-common';
export * from './index-common';
let context;
const fontPath = path.join(knownFolders.currentApp().path, 'fonts');

Font.prototype.getAndroidTypeface = profile('getAndroidTypeface', function () {
    if (!this._typeface) {
        if (!context) {
            context = Application.android.context;
        }
        this._typeface = (com as any).nativescript.text.Font.createTypeface(context, fontPath, this.fontFamily, this.fontWeight, this.isBold, this.isItalic);
    }
    return this._typeface;
});

declare module '@nativescript/core/ui/text-base/formatted-string' {
    interface FormattedString {
        toNativeString(): string;
    }
}
declare module '@nativescript/core/ui/text-base/span' {
    interface Span {
        toNativeString(): string;
    }
}

FormattedString.prototype.toNativeString = LightFormattedString.prototype.toNativeString = function () {
    let result = '';
    const length = this.spans.length;
    let span: Span;
    for (let i = 0; i < length; i++) {
        span = this.spans.getItem(i);
        result += span.toNativeString() + (i < length - 1 ? String.fromCharCode(0x1f) : '');
    }

    return result;
};

Span.prototype.toNativeString = function () {
    const textTransform = this.parent.parent.textTransform;
    const spanStyle = this.style;
    let backgroundColor: Color;
    if (backgroundColorProperty.isSet(spanStyle)) {
        backgroundColor = spanStyle.backgroundColor;
    }

    let textDecoration;
    if (textDecorationProperty.isSet(spanStyle)) {
        textDecoration = spanStyle.textDecoration;
    } else if (this.parent.textDecoration) {
        // span.parent is FormattedString
        textDecoration = this.parent.style.textDecoration;
    } else if (textDecorationProperty.isSet(this.parent.parent.style)) {
        // span.parent.parent is TextBase
        textDecoration = this.parent.parent.style.textDecorations;
    }

    let text = this.text;
    if (text && textTransform != null && textTransform !== 'none') {
        text = getTransformedText(text, textTransform);
    }
    const delimiter = String.fromCharCode(0x1e);
    const result = `${this.fontFamily || 0}${delimiter}${this.fontSize !== undefined ? this.fontSize : -1}${delimiter}${this.fontWeight || ''}${delimiter}${
        this.fontStyle === 'italic' ? 1 : 0
    }${delimiter}${textDecoration || 0}${delimiter}${this.color ? this.color.android : -1}${delimiter}${backgroundColor ? backgroundColor.android : -1}${delimiter}${this.text}`;
    return result;
};

function isBold(fontWeight: FontWeight): boolean {
    return fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900';
}

type BaselineAdjustedSpan = new (fontSize, align: string, maxFontSize) => android.text.style.MetricAffectingSpan;

// eslint-disable-next-line no-redeclare
let BaselineAdjustedSpan: BaselineAdjustedSpan;
function initializeBaselineAdjustedSpan(): void {
    if (BaselineAdjustedSpan) {
        return;
    }
    @NativeClass
    class BaselineAdjustedSpanImpl extends android.text.style.CharacterStyle {
        align: string = 'baseline';
        maxFontSize: number;

        constructor(private fontSize, align: string, maxFontSize) {
            super();

            this.align = align;
            this.maxFontSize = maxFontSize;
        }

        updateDrawState(paint: android.text.TextPaint) {
            this.updateState(paint);
        }

        updateState(paint: android.text.TextPaint) {
            const fontSize = this.fontSize;
            paint.setTextSize(fontSize);
            const metrics = paint.getFontMetrics();
            let result = computeBaseLineOffset(this.align, metrics.ascent, metrics.descent, metrics.bottom, metrics.top, fontSize, this.maxFontSize);
            result += metrics.bottom;
            paint.baselineShift = result;
        }
    }

    BaselineAdjustedSpan = BaselineAdjustedSpanImpl as any;
}

export const createNativeAttributedString = profile('getAndroidTypeface', function createNativeAttributedString(
    data:
        | {
              text: string;
              color?: Color | string | number;
              familyName?: string;
              fontSize?: number;
              letterSpacing?: number;
              lineHeight?: number;
              textAlignment?: number | TextAlignment;
          }
        | FormattedString
) {
    if (!context) {
        context = Application.android.context;
    }
    if (typeof data['toNativeString'] === 'function') {
        const nativeString = (data as any).toNativeString();
        return (com as any).nativescript.text.Font.stringBuilderFromFormattedString(context, fontPath, nativeString);
    }
    // if (data.textAlignment && typeof data.textAlignment === 'string') {
    //     data.textAlignment = textAlignmentConverter(data.textAlignment);
    // }
    // if (data.color && !(data.color instanceof Color)) {
    //     data.color = new Color(data.color as any);
    // }
    const result = (com as any).nativescript.text.Font.stringBuilderFromHtmlString(context, fontPath, (data as any).text) as android.text.SpannableStringBuilder;
    return result;
});
