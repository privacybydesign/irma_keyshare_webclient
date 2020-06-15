import React, { Component } from 'react';
import connect from "react-redux/lib/connect/connect";

const mapStateToProps = state => {
  return {
    sessionState: state.login.sessionState,
  };
};

class App extends Component {
  render() {
    console.log(this.props.sessionState);
    if (this.props.sessionState === 'unknown') {
      return <p>Loading...</p>
    } else if (this.props.sessionState === 'loggedIn') {
      return <p>Logged in</p>
    } else {
      return <p>Not logged in</p>
    }
  }
}

export default connect(mapStateToProps)(App);
