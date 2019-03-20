import React, { Component } from "react";

export default class ContactMenu extends Component {
  render() {
    const nensMail = unescape("servicedesk%40nelen%2Dschuurmans%2Enl");
    const chrisTel = unescape("%30%34%30%35%20%30%35%32%20%34%36%32");
    const chrisMail = unescape("cgooch%40cityofparramatta%2Ensw%2Egov%2Eau");

    return (
      <div style={{ padding: 20 }}>
        <h4 style={{ padding: 0, margin: 0 }}>Contact info</h4>
        <hr />
        <p>
          For software issues with the FloodSmart Parramatta System please
          contact Nelen & Schuurmans on {nensMail}. For any other issues, or
          suggestions for improvements to the Parramatta Floodsmart System
          system, please contact Chris Gooch on tel.&nbsp;
          {chrisTel} or email {chrisMail}
        </p>
      </div>
    );
  }
}
