const {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  createContext
} = React;

/**
 * Globals
 */

const CONSTANTS = {
  assetPath: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/184729"
};
const ASSETS = {
  head: `${CONSTANTS.assetPath}/head.svg`,
  waiting: `${CONSTANTS.assetPath}/hand.svg`,
  stalking: `${CONSTANTS.assetPath}/hand-waiting.svg`,
  grabbing: `${CONSTANTS.assetPath}/hand.svg`,
  grabbed: `${CONSTANTS.assetPath}/hand-with-cursor.svg`,
  shaka: `${CONSTANTS.assetPath}/hand-surfs-up.svg`
};

// Preload images
Object.keys(ASSETS).forEach(key => {
  const img = new Image();
  img.src = ASSETS[key];
});
const useHover = () => {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const enter = () => setHovered(true);
  const leave = () => setHovered(false);
  useEffect(() => {
    ref.current.addEventListener("mouseenter", enter);
    ref.current.addEventListener("mouseleave", leave);
    return () => {
      ref.current.removeEventListener("mouseenter", enter);
      ref.current.removeEventListener("mouseleave", leave);
    };
  }, [ref]);
  return [ref, hovered];
};

// Posisi Mouse
const useMousePosition = () => {
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  useEffect(() => {
    const setFromEvent = e => setPosition({
      x: e.clientX,
      y: e.clientY
    });
    window.addEventListener("mousemove", setFromEvent);
    return () => {
      window.removeEventListener("mousemove", setFromEvent);
    };
  }, []);
  return position;
};

// Posisi Element
const usePosition = () => {
  const ref = useRef();
  const [position, setPosition] = useState({});
  const handleResize = () => {
    setPosition(ref.current.getBoundingClientRect());
  };
  useLayoutEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref.current]);
  return [ref, position];
};

/**
 * React Komponen
 */

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      debug: false,
      cursorGrabbed: false,
      gameOver: false
    };
    this.handleToggleDebug = this.handleToggleDebug.bind(this);
    this.handleButtonClicked = this.handleButtonClicked.bind(this);
    this.handleCursorGrabbed = this.handleCursorGrabbed.bind(this);
  }
  handleToggleDebug() {
    this.setState({
      debug: !this.state.debug
    });
  }
  handleCursorGrabbed() {
    this.setState({
      cursorGrabbed: true
    });
    setTimeout(() => {
      this.setState({
        cursorGrabbed: false
      });
    }, 2000);
  }
  handleButtonClicked() {
    this.setState({
      gameOver: true
    });
    setTimeout(() => {
      this.setState({
        gameOver: false
      });
    }, 4000);
  }
  render() {
    const {
      cursorGrabbed,
      gameOver,
      debug
    } = this.state;
    const screenStyle = cursorGrabbed ? {
      cursor: "none"
    } : {};
    const appClass = debug ? "app app--debug" : "app";
    return /*#__PURE__*/React.createElement("div", {
      className: appClass,
      style: screenStyle
    }, /*#__PURE__*/React.createElement("section", {
      className: "container"
    }, /*#__PURE__*/React.createElement("h1", null, "Hello !"), /*#__PURE__*/React.createElement("h2", null, "Welcome to my profile."), /*#__PURE__*/React.createElement("p", null, "Nama Saya Raka, Front End Dev, Dan Tentunya Saya Pelajar Di SMK Assalaam Bandung"), /*#__PURE__*/React.createElement("p", null, "Click Button Di Samping Kalo Bisa Dikasih 1 Miliyar Hehe ..."), /*#__PURE__*/React.createElement("button", {
      className: "debug-button",
      onClick: this.handleToggleDebug
    }, "Debug")), /*#__PURE__*/React.createElement("button", {
      className: "trap-button",
      onClick: this.handleButtonClicked
    }, gameOver && "Oke Nice", cursorGrabbed && "Yah Kamu Noob!", !gameOver && !cursorGrabbed && "Button!"), /*#__PURE__*/React.createElement("div", {
      className: "grab-zone-wrapper"
    }, /*#__PURE__*/React.createElement(GrabZone, {
      onCursorGrabbed: this.handleCursorGrabbed,
      cursorGrabbed: cursorGrabbed,
      gameOver: gameOver
    })));
  }
}

// Zona Jangkauan Yang Akan Di Trigger
const GrabZone = ({
  cursorGrabbed,
  gameOver,
  onCursorGrabbed
}) => {
  const [outerRef, outerHovered] = useHover();
  const [innerRef, innerHovered] = useHover();
  const [isExtended, setExtendedArm] = useState(false);
  let state = "Ngumpet";
  if (outerHovered) {
    state = "stalking";
  }
  if (innerHovered) {
    state = "grabbing";
  }
  if (cursorGrabbed) {
    state = "grabbed";
  }
  if (gameOver) {
    state = "Coba";
  }
  useEffect(() => {
    let timer;
    if (state === "grabbing") {
      timer = setTimeout(() => {
        setExtendedArm(true);
        timer = null;
      }, 2000);
    }
    return () => {
      setExtendedArm(false);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [state]);
  return /*#__PURE__*/React.createElement("div", {
    className: "grab-zone",
    ref: outerRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "grab-zone__debug"
  }, /*#__PURE__*/React.createElement("strong", null, "Debug info:"), /*#__PURE__*/React.createElement("p", null, "Aksi: ", state), /*#__PURE__*/React.createElement("p", null, "arm: ", isExtended ? "Yes" : "No")), /*#__PURE__*/React.createElement("div", {
    className: "grab-zone__danger",
    ref: innerRef
  }, /*#__PURE__*/React.createElement(Grabber, {
    state: state,
    gameOver: gameOver,
    extended: isExtended,
    onCursorGrabbed: onCursorGrabbed
  })));
};
const Grabber = ({
  state,
  gameOver,
  extended,
  onCursorGrabbed
}) => {
  const mousePos = useMousePosition();
  const [ref, position] = usePosition();
  const hasCursor = false;
  const x = position.left + position.width * 0.5;
  const y = position.top + position.height * 0.5;
  const angle = gameOver ? 0 : Math.atan2(mousePos.x - x, -(mousePos.y - y)) * (180 / Math.PI);
  const rotation = Math.min(Math.max(parseInt(angle), -79), 79);
  const grabberClass = `grabber grabber--${state} ${extended && "grabber--extended"}`;
  const wrapperStyle = {
    transform: `rotate(${rotation}deg)`
  };
  let handImageSrc = ASSETS[state];
  return /*#__PURE__*/React.createElement("div", {
    className: grabberClass
  }, /*#__PURE__*/React.createElement("div", {
    className: "grabber__body"
  }), /*#__PURE__*/React.createElement("img", {
    className: "grabber__face",
    src: ASSETS.head
  }), /*#__PURE__*/React.createElement("div", {
    className: "grabber__arm-wrapper",
    ref: ref,
    style: wrapperStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: "grabber__arm"
  }, /*#__PURE__*/React.createElement("img", {
    className: "grabber__hand",
    src: handImageSrc,
    onMouseEnter: onCursorGrabbed
  }))));
};

// Render app
ReactDOM.render( /*#__PURE__*/React.createElement(App, null), document.getElementById("app"));