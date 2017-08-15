import React from 'react'
import cx from "classnames";
import { CustomPicker } from "react-color";
import Alpha from 'react-color/lib/components/common/Alpha';
import EditableInput from 'react-color/lib/components/common/EditableInput';
import Hue from 'react-color/lib/components/common/Hue';
import Checkboard from 'react-color/lib/components/common/Checkboard';
import Saturation from 'react-color/lib/components/common/Saturation';
import color from 'react-color/lib/helpers/color';
import SketchPresetColors from 'react-color/lib/components/sketch/SketchPresetColors'

function SketchFields({ onChange, rgb, hsl, hex, disableAlpha, refCallback }) {
  const styles = {
    fields: {
      display: 'flex',
      paddingTop: '4px',
    },
    single: {
      flex: '1',
      paddingLeft: '6px',
    },
    alpha: {
      flex: '1',
      paddingLeft: '6px',
    },
    double: {
      flex: '2',
    },
    input: {
      width: '80%',
      padding: '4px 10% 3px',
      border: 'none',
      boxShadow: 'inset 0 0 0 1px #ccc',
      fontSize: '11px',
    },
    label: {
      display: 'block',
      textAlign: 'center',
      fontSize: '11px',
      color: '#eee',
      paddingTop: '3px',
      paddingBottom: '4px',
      textTransform: 'capitalize',
    }
  }

  const handleChange = (data, e) => {
    if (data.hex) {
      color.isValidHex(data.hex) && onChange({
        hex: data.hex,
        source: 'hex',
      }, e)
    } else if (data.r || data.g || data.b) {
      onChange({
        r: data.r || rgb.r,
        g: data.g || rgb.g,
        b: data.b || rgb.b,
        a: rgb.a,
        source: 'rgb',
      }, e)
    } else if (data.a) {
      if (data.a < 0) {
        data.a = 0
      } else if (data.a > 100) {
        data.a = 100
      }

      data.a = data.a / 100
      onChange({
        h: hsl.h,
        s: hsl.s,
        l: hsl.l,
        a: data.a,
        source: 'rgb',
      }, e)
    }
  }

  return (
    <div style={styles.fields} className="flexbox-fix">
      <div style={styles.double}>
        <EditableInput
          style={{ input: styles.input, label: styles.label }}
          label="hex"
          value={hex.replace('#', '')}
          onChange={handleChange}
          ref={refCallback}
        />
      </div>
      <div style={styles.single}>
        <EditableInput
          style={{ input: styles.input, label: styles.label }}
          label="r"
          value={rgb.r}
          onChange={handleChange}
          dragLabel="true"
          dragMax="255"
        />
      </div>
      <div style={styles.single}>
        <EditableInput
          style={{ input: styles.input, label: styles.label }}
          label="g"
          value={rgb.g}
          onChange={handleChange}
          dragLabel="true"
          dragMax="255"
        />
      </div>
      <div style={styles.single}>
        <EditableInput
          style={{ input: styles.input, label: styles.label }}
          label="b"
          value={rgb.b}
          onChange={handleChange}
          dragLabel="true"
          dragMax="255"
        />
      </div>
      <div style={styles.alpha}>
        <EditableInput
          style={{ input: styles.input, label: styles.label }}
          label="a"
          value={Math.round(rgb.a * 100)}
          onChange={handleChange}
          dragLabel="true"
          dragMax="100"
        />
      </div>
    </div>
  )
}


class SketchPicker extends React.Component<any, any> {
  _hexInput:any;
  componentDidMount() {
    setTimeout(() => {
      if(this._hexInput) {
        this._hexInput.input.select();
      }
    }, 0)
  }

  render() {
    let { width, rgb, hex, hsv, hsl, onChange, disableAlpha,
      presetColors, renderers } = this.props;

    var activeColor = { background: `rgba(${rgb.r},${rgb.g},${rgb.b},${rgb.a})` }
    var className = cx("colorpicker", this.props.className, { disableAlpha: disableAlpha });
    return <div className={className} style={this.props.style}>
      <div className="colorpicker__saturation">
        <Saturation
          className="colorpicker__Saturation"
          hsl={hsl}
          hsv={hsv}
          onChange={onChange}
        />
      </div>
      <div className="colorpicker__controls flexbox-fix">
        <div className="colorpicker__sliders">
          <div className="colorpicker__hue">
            <Hue
              className="colorpicker__Hue"
              hsl={hsl}
              onChange={onChange}
            />
          </div>
          <div className="colorpicker__alpha">
            <Alpha
              className="colorpicker__Alpha"
              rgb={rgb}
              hsl={hsl}
              renderers={renderers}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="colorpicker__color">
          <Checkboard />
          <div className="colorpicker__activeColor" style={activeColor} />
        </div>
      </div>

      <SketchFields
        rgb={rgb}
        hsl={hsl}
        hex={hex}
        onChange={onChange}
        disableAlpha={disableAlpha}
        refCallback={(e)=>this._hexInput = e}
      />
      <SketchPresetColors colors={presetColors} onClick={onChange} />
    </div>
  }
}

export default CustomPicker(SketchPicker)
