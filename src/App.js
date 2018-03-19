import React, { Component } from 'react';
import './App.css';

import Hammer from 'hammerjs'

import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import tinycolor from 'tinycolor2'

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      displayColorPickers: true,
      padding: 50,
      innerPadding: 10,
      backgroundColor: '#111',
      foregroundColor: '#fff',
      paper: 0,
      dimension: 4,
      folds: 8,
      spiralDimension: 2,
      borderWidth: 0.008,
    }
  }

  generatePaper (opacity) {
    const rects = []
    
    if (opacity === 0) {
      return rects
    }

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    for (let w=0; w < actualWidth -1 ; w += 2) {
      for (let h=0; h < actualHeight -1; h += 2) {
        let g = this.between(75, 95)
        rects.push(<rect key={`${w}-${h}`} x={w} y={h} height={2} width={2}
          fill={tinycolor({r: 255 * g/100, g: 255 * g/100, b: 255 * g/100 }).toHexString() }
          fillOpacity={opacity} />)
      }
    }

    for (let i = 0; i < 30; i++) {
      let g2 = this.between(40, 60)
      rects.push(<rect key={`${i}-dot`} width={this.between(1,2)} height={this.between(1,2)}
        x={this.between(0, actualWidth-2)}
        y={this.between(0, actualHeight-2)}
        fill={ tinycolor({r: 255 * g2/100, g: 255 * g2/100, b: 255 * g2/100 }).toHexString()}
        fillOpacity={this.between(opacity*250, opacity*300)/100} />)
    }

    return rects
  }

  componentWillMount () {
    this.updateDimensions()
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions.bind(this), true)
    window.removeEventListener('keydown', this.handleKeydown.bind(this), true)
    window.clearInterval(this.interval)
  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions.bind(this), true)
    window.addEventListener('keydown', this.handleKeydown.bind(this), true)

    this.interval = window.setInterval(this.tick.bind(this), 400)

    const mc = new Hammer(document, { preventDefault: true })

    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
    mc.get('pinch').set({ enable: true })

    
     mc.on("swipedown", ev => this.decrementDimension())
      .on("swipeup", ev => this.incrementDimension())
      .on("swipeleft", ev => this.decrementFolds())
      .on("swiperight", ev => this.incrementFolds())
      .on("pinchin", ev => { this.incrementDimension()})
      .on("pinchout", ev => { this.decrementDimension()})
  }

  handleKeydown (ev) {
    if (ev.which === 67 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.setState({displayColorPickers: !this.state.displayColorPickers})
    } else if (ev.which === 83 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.handleSave()
    } else if (ev.which === 82 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.forceUpdate()
    } else if (ev.which === 84) {
      ev.preventDefault()
      this.toggleRun()
    } else if (ev.which === 80 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.togglePaper()
    } else if (ev.which === 40 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
    } else if (ev.which === 40) {
      ev.preventDefault()
      this.decrementDimension()
    } else if (ev.which === 38 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
    } else if (ev.which === 38) {
      ev.preventDefault()
      this.incrementDimension()
    } else if (ev.which === 37 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
    } else if (ev.which === 37) {
      ev.preventDefault()
      this.decrementFolds()
    } else if (ev.which === 39 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
    } else if (ev.which === 39) {
      ev.preventDefault()
      this.incrementFolds()
    }
  }

  togglePaper() {
    this.setState({paper: this.state.paper ? 0 : 0.1})
  }

  incrementFolds () {
    this.setState({folds: Math.min(40, this.state.folds + 1)})
  }

  decrementFolds () {
    this.setState({folds: Math.max(2, this.state.folds - 1)})
  }

  incrementDimension () {
    this.setState({dimension: Math.min(40, this.state.dimension + 2)})
  }

  decrementDimension () {
    this.setState({dimension: Math.max(2, this.state.dimension - 2)})
  }

  handleSave () {
    const svgData = document.getElementsByTagName('svg')[0].outerHTML   
    const link = document.createElement('a')
    
    var svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    var svgURL = URL.createObjectURL(svgBlob)
    link.href = svgURL 

    link.setAttribute('download', `reflections.svg`)
    link.click()
  }

  between (min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  getActualHeight () {
    return this.state.height-2*this.state.padding
  }

  getActualWidth () {
    return this.state.width-2*this.state.padding
  }

  toggleRun() {
    this.setState({running: !this.state.running})
  }

  tick () {
    if (this.state.running) {
      this.forceUpdate()
    }
  }

  shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }

  updateDimensions () {
    const w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0]
    
    const width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight

    const dim = Math.min(width, height)
    const settings = { width: dim, height: dim }

    if (width < 500) {
      settings.height = width
      settings.padding = 0
      settings.innerPadding = 15
    } else {
      settings.padding = 50
      settings.innerPadding = settings.padding
    }

    this.setState(settings)
  }

  drawGrid () {
    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()
    
    const blockWidth = actualWidth * (1-this.state.borderWidth*(this.state.dimension +1))/this.state.dimension
    const borderWidth = this.state.borderWidth * actualHeight

    const grids = []

    for (let i=0; i <= this.state.dimension; i++) {
      grids.push(<rect key={'x'+i} x={i*borderWidth + i * blockWidth} y={0} height={'100%'} width={borderWidth} stroke={this.state.backgroundColor} fill={this.state.backgroundColor} />)
      grids.push(<rect key={'y'+i} y={i*borderWidth + i * blockWidth} x={0} width={'100%'} height={borderWidth} stroke={this.state.backgroundColor} fill={this.state.backgroundColor} />)
    }

    return grids
  }

  generateRect(x, y, fill, nSize) {
    nSize = nSize || 1
    fill = fill || this.state.foregroundColor

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()
    
    const blockWidth = actualWidth * (1-this.state.borderWidth*(this.state.dimension +1))/this.state.dimension
    
    const rectWidth =  blockWidth * nSize + this.state.borderWidth*actualWidth*(nSize-1)

    return <rect x={this.state.borderWidth*actualWidth * x + (x-1)*blockWidth}
                y={this.state.borderWidth*actualHeight * y + (y-1)*blockWidth}
                width={rectWidth} height={rectWidth} fill={fill} />
  }


  generateRectWithSpirals(x, y, fill, circleFill, nSize, showCircles, flip) {
    nSize = nSize || 1
    fill = fill || this.state.foregroundColor

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()
    
    const blockWidth = actualWidth * (1-this.state.borderWidth*(this.state.dimension +1))/this.state.dimension
    
    const rectWidth =  blockWidth * nSize + this.state.borderWidth*actualWidth*(nSize-1)

    const cx = this.state.borderWidth*actualWidth * x + (x-1)*blockWidth + rectWidth/2
    const cy = this.state.borderWidth*actualHeight * y + (y-1)*blockWidth + rectWidth/2

    const circles = []
    let radius = 1.2

    for (let i=0; i < this.state.folds; i++){
      circles.push(<circle key={'circle-'+i} cx={cx}
                      cy={cy}
                      r={rectWidth*radius/2} fill={i%2 === 0 ? circleFill: fill} />)
      
      radius -= 1/this.state.folds
    }

    let mainCol = !flip ? fill : circleFill
    let cCol = !flip ? circleFill : fill

    return (
              <g>
                <rect x={this.state.borderWidth*actualWidth * x + (x-1)*blockWidth}
                  y={this.state.borderWidth*actualHeight * y + (y-1)*blockWidth}
                  width={rectWidth} height={rectWidth} fill={fill} />
                {circles}
                {showCircles ? this.generateRectAndCircle(x,y, mainCol, cCol, 1) : null}
                {showCircles ? this.generateRectAndCircle(x+1,y+1, cCol, mainCol, 1) : null}
              </g>
            )
  }

  generateRectAndCircle(x, y, fill, circleFill, nSize) {
    nSize = nSize || 1
    fill = fill || this.state.foregroundColor
    circleFill = circleFill || this.state.backgroundColor

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()
    
    const blockWidth = actualWidth * (1-this.state.borderWidth*(this.state.dimension +1))/this.state.dimension
    
    const rectWidth =  blockWidth * nSize + this.state.borderWidth*actualWidth*(nSize-1)

    return (
            <g>
              <rect x={this.state.borderWidth*actualWidth * x + (x-1)*blockWidth}
                y={this.state.borderWidth*actualHeight * y + (y-1)*blockWidth}
                width={rectWidth} height={rectWidth} fill={fill} />
              
              <circle cx={this.state.borderWidth*actualWidth * x + (x-1)*blockWidth + rectWidth/2}
                      cy={this.state.borderWidth*actualHeight * y + (y-1)*blockWidth + rectWidth/2}
                      r={rectWidth*0.96/2} fill={circleFill} />
            </g>
    )
  }

  generateClipPath(x, y, pathId, nSize) {
    nSize = nSize || 1

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()
    
    const blockWidth = actualWidth * (1-this.state.borderWidth*(this.state.dimension +1))/this.state.dimension
    
    const rectWidth =  blockWidth * nSize + this.state.borderWidth*actualWidth*(nSize-1)

    return (
      <clipPath key={"clip-"+pathId} id={pathId}>
        <rect x={this.state.borderWidth*actualWidth * x + (x-1)*blockWidth}
                y={this.state.borderWidth*actualHeight * y + (y-1)*blockWidth}
                width={rectWidth} height={rectWidth} />
      </clipPath>
    )
  }

  generateClipPaths () {
    let i = this.state.dimension - 1
    let j = 1

    const clipPaths = []
    
    while (i > 0) {
      const g = this.generateClipPath(i,j, `${i}-${j}`, this.state.spiralDimension)
      
      i -= 1
      j += 1

      clipPaths.push(g)
    }

    return clipPaths
  }

  generateSpirals (showCircles) {
    let i = this.state.dimension - 1
    let j = 1
    let count = 1
    const spirals = []
    
    while (i > 0) {
      const g = (
        <g key={i} clipPath={`url(#${i}-${j})`}>
          {
            this.generateRectWithSpirals(
              i, j, this.state.foregroundColor, this.state.backgroundColor,
              this.state.spiralDimension, showCircles,  (count + 3) % 4 === 0)
          }
        </g>
      )

      count ++

      i -= 1
      j += 1

      spirals.push(g)
    }

    return spirals
  }

  render () {
    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    return (
      <div className="App">
        { this.state.displayColorPickers ? <div className="color-pickers">
          <ColorPicker color={tinycolor(this.state.backgroundColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({backgroundColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.foregroundColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({foregroundColor: color.hex}) } /> </div> : null
        }

        <div style={{ padding: this.state.padding }}> 
          <svg width={actualWidth} height={actualHeight}>
            <defs>
              {this.generateClipPaths()}
            </defs>
            <rect width='100%' height='100%' fill={this.state.backgroundColor} />
            <g>
              {
                this.generateSpirals(false).filter(function(element, index, array) {
                  return (index % 2 !== 0);
                })
              }
              {
                this.generateSpirals(true).filter(function(element, index, array) {
                  return (index % 2 === 0);
                })
              }
            </g>
            <g>
              {this.drawGrid()}
            </g>

            <g>
              {this.generatePaper(this.state.paper)}
            </g>
          </svg>
        </div>

      </div>
    )
  }
}

class ColorPicker extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      color: props.color,
      displayColorPicker: props.displayColorPicker,
      disableAlpha: props.disableAlpha
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
    this.props.handleChange(color)
  };

  render () {

    const styles = reactCSS({
      'default': {
        color: {
          background: this.state.disableAlpha ?
                `rgb(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b })` :
                `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b },  ${ this.state.color.a })`,
        },
        popover: {
          position: 'absolute',
          zIndex: '10',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    })

    return (
      <div className='color-picker'>
        <div className='swatch' onClick={ this.handleClick }>
          <div className='color' style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange } disableAlpha={this.state.disableAlpha} />
        </div> : null }
      </div>
    )
  }
}

export default App;
