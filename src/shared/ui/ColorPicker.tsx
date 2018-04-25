import * as React from 'react'
import * as cx from "classnames";
import { CustomPicker } from "react-color";
import Alpha from 'react-color/lib/components/common/Alpha';
import EditableInput from 'react-color/lib/components/common/EditableInput';
import Hue from 'react-color/lib/components/common/Hue';
import Checkboard from 'react-color/lib/components/common/Checkboard';
import Saturation from 'react-color/lib/components/common/Saturation';
import color from 'react-color/lib/helpers/color';
import SketchPresetColors from 'react-color/lib/components/sketch/SketchPresetColors'
import styled from 'styled-components';
import { CarbonLabel } from "../../CarbonFlux";
import { colors as theme } from '../../theme';

function SketchFields({ onChange, rgb, hsl, hex, disableAlpha, refCallback }) {
  const styles = {
    input: {
      width: '100%',
      border: 'none',
      borderRadius: '2px',
      fontSize: '14px',
      backgroundColor: theme.input_background,
      color: theme.text_color,
      textAlign: 'center'
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
    <RgbaLine>
      <EditableInput
        style={{ input: styles.input, label: styles.label }}
        value={hex.replace('#', '')}
        label="hex"
        onChange={handleChange}
        ref={refCallback}
      />
      <EditableInput
        style={{ input: styles.input, label: styles.label }}
        value={rgb.r}
        label="r"
        onChange={handleChange}
        dragLabel="true"
        dragMax="255"
      />
      <EditableInput
        style={{ input: styles.input, label: styles.label }}
        value={rgb.g}
        label="g"
        onChange={handleChange}
        dragLabel="true"
        dragMax="255"
      />
      <EditableInput
        style={{ input: styles.input, label: styles.label }}
        value={rgb.b}
        label="b"
        onChange={handleChange}
        dragLabel="true"
        dragMax="255"
      />
      <EditableInput
        style={{ input: styles.input, label: styles.label }}
        value={Math.round(rgb.a * 100)}
        onChange={handleChange}
        label="a"
        dragLabel="true"
        dragMax="100"
      />
    </RgbaLine>
  )
}

const RgbaLine = styled.div`
  display:grid;
  grid-template-columns: 60px 1fr 1fr 1fr 1fr;
  grid-column-gap: 5px;
  margin-top: 10px;
  justify-content:center;
  align-items:center;
`;

class SketchPicker extends React.Component<any, any> {
  _hexInput: any;
  componentDidMount() {
    setTimeout(() => {
      if (this._hexInput) {
        this._hexInput.input.select();
      }
    }, 0)
  }

  render() {
    let { width, rgb, hex, hsv, hsl, onChange, disableAlpha,
      presetColors, renderers } = this.props;

    var activeColor = { background: `rgba(${rgb.r},${rgb.g},${rgb.b},${rgb.a})` }
    return <ColorPickerContainer onMouseDown={this.props.onMouseDown} onMouseUp={this.props.onMouseUp}>
      <Cell>
        <Saturation
          className="saturation"
          hsl={hsl}
          hsv={hsv}
          onChange={onChange}
        />
      </Cell>
      <Cell>
        <Hue
          className="hue"
          hsl={hsl}
          onChange={onChange}
        />
      </Cell>
      <Cell>
        <Alpha
          className="alpha"
          rgb={rgb}
          hsl={hsl}
          renderers={renderers}
          onChange={onChange}
        />
      </Cell>
      <Cell>
        <SketchFields
          rgb={rgb}
          hsl={hsl}
          hex={hex}
          onChange={onChange}
          disableAlpha={disableAlpha}
          refCallback={(e) => this._hexInput = e}
        />
      </Cell>

      <Cell>
        <SketchPresetColors colors={presetColors} onClick={onChange} />
      </Cell>
    </ColorPickerContainer>
  }
}

const ColorPickerContainer = styled.div`
  display:grid;
  grid-template-rows: 143px 8px 8px 48px 1fr;
  grid-template-columns: 1fr;
  width:100%;
  height:100%;
  padding: 0 ${theme.margin1};
  grid-row-gap:10px;
`;

const Cell = styled.div`
  position:relative;
  width:100%;
  height:100%;
`;

export default CustomPicker(SketchPicker)
