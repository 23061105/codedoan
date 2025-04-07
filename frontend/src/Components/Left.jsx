import React from "react";

const Left = () => {
  return (
    <>
      <div className="left">
        <a className="profile">
          <div className="profile-photo">
            <img src="./images/profile-1.jpg" />
          </div>
          <div className="handle">
            <h4>Diana Ayi</h4>
            <p className="text-muted">@dayi</p>
          </div>
        </a>
        {/* <!----------------- SIDEBAR --------------------> */}
        <div className="sidebar">
          <a className="menu-item active">
            <span>
              <i className="uil uil-home"></i>
            </span>
            <h3>Home</h3>
          </a>

          <a className="menu-item">
            <span>
              <i className="uil uil-compass"></i>
            </span>
            <h3>Explore</h3>
          </a>

          <a className="menu-item" id="notifications">
            <span>
              <i className="uil uil-bell">
                <small className="notification-count">9+</small>
              </i>
            </span>
            <h3>Notifications</h3>
            {/* <!---------------NOTIFICATION POPUP-----------------> */}
            <div className="notifications-popup">
              <div>
                <div className="profile-photo">
                  <img src="./images/profile-2.jpg" />
                </div>
                <div className="notifications-body">
                  <b>KeKe Benjamin</b> accepted your friend request
                  <small className="text-muted">2 DAYS AGO</small>
                </div>
              </div>

              <div>
                <div className="profile-photo">
                  <img src="./images/profile-3.jpg" />
                </div>
                <div className="notifications-body">
                  <b>LOL</b> comment in your post
                  <small className="text-muted">1 HOUR AGO</small>
                </div>
              </div>

              <div>
                <div className="profile-photo">
                  <img src="./images/profile-4.jpg" />
                </div>
                <div className="notifications-body">
                  <b>KeKe Benjamin</b> and <b>283 others </b> like your post
                  <small className="text-muted">4 MINUTES AGO</small>
                </div>
              </div>

              <div>
                <div className="profile-photo">
                  <img src="./images/profile-5.jpg" />
                </div>
                <div className="notifications-body">
                  <b>KeKe Benjamin</b> commented on a post you're tagged in
                  <small className="text-muted">2 DAYS AGO</small>
                </div>
              </div>

              <div>
                <div className="profile-photo">
                  <img src="./images/profile-4.jpg" />
                </div>
                <div className="notifications-body">
                  <b>DONAL</b>comment on your post
                  <small className="text-muted">4 MINUTES AGO</small>
                </div>
              </div>

              <div>
                <div className="profile-photo">
                  <img src="./images/profile-4.jpg" />
                </div>
                <div className="notifications-body">
                  <b>KeKe Benjamin</b> comment on your post
                  <small className="text-muted">1 MINUTES AGO</small>
                </div>
              </div>
            </div>
          </a>

          <a className="menu-item" id="messages-notification">
            <span>
              <i className="uil uil-envelope">
                <small className="notification-count">6</small>
              </i>
            </span>
            <h3>Message</h3>
          </a>

          <a className="menu-item">
            <span>
              <i className="uil uil-bookmark"></i>
            </span>
            <h3>Bookmarks</h3>
          </a>

          <a className="menu-item">
            <span>
              <i className="uil uil-chart-line"></i>
            </span>
            <h3>Analytics</h3>
          </a>

          <a className="menu-item" id="theme">
            <span>
              <i className="uil uil-palette"></i>
            </span>
            <h3>Themes</h3>
          </a>

          <a className="menu-item">
            <span>
              <i className="uil uil-setting"></i>
            </span>
            <h3>Settings</h3>
          </a>

          {/* <!--------------- END OF SIDE BAR -----------------> */}
        </div>
        <label for="create-post" className="btn btn-primary">
          Create Post
        </label>
      </div>
    </>
  );
};

export default Left;
