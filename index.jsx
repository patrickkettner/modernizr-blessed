import Open from 'open';
import Fuse from 'fuse.js';
import blessed from 'blessed';
import tempfile from 'tempfile';
import cliparoo from 'cliparoo';
import modernizr from 'modernizr';
import {gruntify} from './gruntify';
import React, {Component} from 'react';
import {render} from 'react-blessed';
import {codepenify} from './codepenify';
import _intersection from 'lodash.intersection';
import {writeFileSync, unlinkSync} from 'fs';
import {codepenTempFile} from './codepenTempFile';

const fuseOptions = {
  caseSensitive: false,
  threshold: 0.3,
  keys: ['name','property', 'caniuse', 'cssclass', 'tags', 'aliases', 'builderAliases'],
  maxPatternLength: 32
};
const defaultSearch = 'Type a browser feature';
let fuse;

const modernizrMetadata = modernizr.metadata();
const modernizrOptions = modernizr.options().concat({
      name: 'minify',
      property: 'minify',
      group: 'minify',
      checked: true
}/*,{
      name: 'Add CSS classes',
      property: 'setClasses',
      checked: true
}*/);

// Creating our screen
const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: 'Modernizr Download Builder'
});

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: screen.width,
      detects: modernizrMetadata,
      search: defaultSearch,
      rowTop: 0
    };

    fuse = new Fuse(this.state.detects, fuseOptions);
  }

  render() {
    let popUp;

    let detectColumns = (() => {
      if (screen.width >= 180) return 3;
      if (screen.width >= 130) return 2;
      return 1;
    })();

    let getOffset = (rowTop, direction) => {
      return Math.max(0,
        Math.min(
          rowTop + direction,
          Math.ceil(this.state.detects.length / detectColumns) - screen.height + 5
        )
      );
    };

    if (this.state.popUp) {
      popUp = <PopUp
        metadata={this.state.detects}
        hide={() => {
          this.setState({popUp: false});
          return false;
        }}
        minify={modernizrOptions[14].checked}
      />;
    }

    return (
      <form
          keys
          onKeypress={(ch) => {
          if (ch === '/') {
            this.refs.search.focus();
          } else {
            let offset = ch === 'j' ? 1 : ch === 'k' ? -1 : 0;
            this.setState({rowTop: getOffset(this.state.rowTop, offset)});
          }
          }}
          style={{bg: 'white'}}
      >
    <box label='{#db4886-fg}▄▆▉ Modernizr{/#db4886-fg}'
          border={{type: 'line'}}
          style={{border: {fg: '#db4886'}}}
          onResize={() => this.setState({width: screen.width})}
          tags
        >

        <element
          height={3}
          shrink
          style={{bg:'#272727'}}
        >

          <textbox
            height={1}
            width='99.5%'
            left={2}
            top={1}
            style={{fg: 'white', bg:'#272727'}}
            inputOnFocus
            value={this.state.search}
            cursor='line'
            mouse
            keys
            ref='search'
            onFocus={() => {
              if (this.refs.search.value === defaultSearch) {
                this.setState({search: ''});
              }
            }}
            onBlur={() => {
              if (this.state.search === '') {
                this.setState({search: defaultSearch});
              }
            }}
            onKeypress={(ch, key) => {
              let val = this.refs.search.getValue();
              let query;

              if (key.full === 'backspace') {
                query = val.slice(0, -1);
              } else if (key.full.length === 1) {
                query = val + key.sequence;
              } else {
                query = val;
              }

              const results = fuse.search(query);
              const detects = query && query.length ? _intersection(modernizrMetadata, results) : modernizrMetadata;
              this.setState({detects: detects, search: val})
            }}
          />

          <button
            align='center'
            valign='middle'
            height={3}
            width={20}
            right={0}
            style={{fg: 'white', bg:'#db4886'}}
            mouse
            onClick={() => this.setState({popUp: true})}
          >
            BUILD
          </button>
        </element>

        <box
          width={38}
          left={1}
          top={5}
          style={{fg: '#444'}}
        >
        { modernizrMetadata.filter((d) => d.checked).length + ' checked'}
        </box>
        <box
          width={38}
          left={1}
          top={9}
          style={{fg: '#444'}}
        >
        Options
        {modernizrOptions.map((option, i) => {
          const top = i + (option.name === 'minify' ? 2 : 1);

          return <checkbox
            text={option.name}
            key={option.property}
            height={1}
            top={top}
            style={{fg: '#444'}}
            mouse
            keys
            shrink
            checked={option.checked}
            onClick={() => option.checked = !option.checked}
          />
          })
        }
        </box>

        <button
          top={4}
          left={38}
          shrink
          mouse
          keys
          onKeypress={(ch) => {
            let offset = ch === 'j' ? 1 : ch === 'k' ? -1 : 0;
            this.setState({rowTop: getOffset(this.state.rowTop, offset)});
          }}
          onWheeldown={() => {
            this.setState({rowTop: getOffset(this.state.rowTop, 1)});
          }}
          onWheelup={() => {
            this.setState({rowTop: getOffset(this.state.rowTop, -1)});
          }}
        >
          {this.state.detects.map((detect, i, detects) => {
          let foo = this.state.rowTop * detectColumns
          if (i >= foo) {
            i = i - (foo);

            const top = Math.floor( i / detectColumns);
            const left = ((i % detectColumns) * (105 / detectColumns)) + '%'

            const style ={fg: '#444'}

            if (i === 0 ) {
              //select syle here
            }

              return <checkbox
                text={detect.name}
                key={detect.property}
                height={1}
                top={top}
                left={left}
                style={style}
                mouse
                keys
                shrink
                checked={detect.checked}
                onClick={() => {
                  detect.checked = !detect.checked;
                  this.forceUpdate();
                }}
                onWheeldown={() => {
                  this.setState({rowTop: getOffset(this.state.rowTop, 1)});
                }}
                onWheelup={() => {
                  this.setState({rowTop: getOffset(this.state.rowTop, -1)});
                }}
              />
            }
          })}
        </button>
        {popUp}
        </box>
        </form>
    );
  }
}

class PopUp extends Component {
  render() {
    return (
        <box
          width='100%'
          height='100%'
          left={0}
          style={{bg: '#999', transparent: true}}
          clickable
          onClick={() => this.props.hide()}
        >
          <PopUpMenu
            metadata={this.props.metadata}
            minify={this.props.minify}
          />
        </box>
    )
  }
}

class PopUpMenu extends Component {
  render() {
    let classPrefix;
    const options = modernizrOptions.filter((o) => o.checked && o.name !== 'minify')
      .map((o) => o.property);
    const props = this.props;
    const minify = props.minify;
    const checked = props.metadata.filter((d) => d.checked);
    const detects = checked.map((d) => d.amdPath);
    const config = {minify, classPrefix, options, 'feature-detects': detects};

    return (
        <box
          width='45%'
          height={8}
          left='center'
          top='center'
        >
          <box
            left={4}
            right={4}
            top={2}
            bottom={2}
          >
            <PopUpMenuItem
              top={0}
              text='Build'
              click={() => modernizr.build(config, function(result) {
              cliparoo(result);
              })}
            />
            <PopUpMenuItem
              top={1}
              text='Command Line Config'
              click={() => cliparoo(JSON.stringify(config, 0, 2))}
            />
            <PopUpMenuItem
              top={2}
              text='Grunt Config'
              click={() => cliparoo(gruntify(config))}
            />
            <PopUpMenuLink
              linkText="Open build on codepen.io"
              top={3}
              click={() => {
                const detects = checked.map((d) => d.property);

                modernizr.build(config, (build) => {
                  const data = codepenify(detects, build);
                  const tempFileContents = codepenTempFile(data);
                  const scratchFile = tempfile('.html');

                  writeFileSync(scratchFile, tempFileContents);
                  Open(scratchFile);
                  setTimeout(function() {unlinkSync(scratchFile)}, 5000);
                })

                return false;
              }}
            />
            </box>
        </box>
    )
  }
}

class PopUpMenuItem extends Component {

  constructor() {
    super();
    this.state = {};
  }

  render() {
    const props = this.props;

    return (
      <box
        top={props.top}
        >
        <box
          style={{fg: '#444'}}
          shrink
        >
          {props.text}
        </box>
        <PopUpMenuLink
          right={0}
          click={props.click}
          linkText={this.state.copyStr}
        />
      </box>
    )
  }
}


class PopUpMenuLink extends Component {

  constructor(props) {
    super(props);

    this.state = {
      linkText: props.linkText
    };
  }

  render() {
    const props = this.props;
    const linkText = this.state.linkText || 'Copy to Clipboard';

    return (
        <button
          style={{fg: '#db4886'}}
          right={props.right}
          top={props.top}
          ref={props.ref}
          shrink
          mouse
          onClick={() => {
            this.setState({linkText: 'Copied!'});
            props.click.call(arguments)
            setTimeout(() => {this.setState({linkText: undefined})}, 1500)
          }}
          >
          {linkText}
        </button>
    )
  }
}

class FileManager extends Component {

  render() {
    const props = this.props;

    return (
      <box
        border='line'
        height={3}
        width="80%"
        top="center"
        left="center"
        style={{border: {fg: '#db4886'}}}
      >
        <textbox
          top={0}
          left={0}
          height={1}
          keys
          mouse
          inputOnFocus
          tags
          style={{fg: '#db4886'}}
          >
        </textbox>
      </box>
    )
  }
}

// Adding a way to quit the program
screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

// Rendering the React app using our sbelcreen
const component = render(<App />, screen);
