import React from "react";

const Right = () => {
  return (
    <>
      <div className="right">
        <div className="messages">
          <div className="heading">
            <h4>Messages</h4>
            <i className="uil uil-edit"></i>
          </div>
          <div className="search-bar">
            <i className="uil uil-search"></i>
            <input
              type="search"
              placeholder="Search messages"
              id="message-search"
            />
          </div>

          {/* <!-- --------------- MESSAGE CATEGORY------------- --> */}
          <div className="category">
            <h6 className="active">Primary</h6>
            <h6>General</h6>
            <h6 className="message-requests">Requests(7)</h6>
          </div>
          {/* <!-- MESSAGE --> */}
          <div className="message">
            <div className="profile-photo">
              <img src="./images/profile-17.jpg" />
            </div>

            <div className="message-body">
              <h5>Edem_Quist</h5>
              <p className="text-muted">Just woke up bruh</p>
            </div>
          </div>
          {/* <!-- MESSAGE --> */}
          <div className="message">
            <div className="profile-photo">
              <img src="./images/profile-17.jpg" />
            </div>

            <div className="message-body">
              <h5>Edem_Quist</h5>
              <p className="text-muted">Just woke up bruh</p>
            </div>
          </div>
          {/* <!-- MESSAGE --> */}
          <div className="message">
            <div className="profile-photo">
              <img src="./images/profile-17.jpg" />
            </div>

            <div className="message-body">
              <h5>Edem_Quist</h5>
              <p className="text-muted">Just woke up bruh</p>
            </div>
          </div>
          {/* <!-- MESSAGE --> */}
          <div className="message">
            <div className="profile-photo">
              <img src="./images/profile-17.jpg" />
            </div>

            <div className="message-body">
              <h5>Edem_Quist</h5>
              <p className="text-bold">Just woke up bruh</p>
            </div>
          </div>
          {/* <!-- MESSAGE --> */}
          <div className="message">
            <div className="profile-photo">
              <img src="./images/profile-17.jpg" />
              <div className="active"></div>
            </div>

            <div className="message-body">
              <h5>SUSAN</h5>
              <p className="text-muted">BIRTHDAY</p>
            </div>
          </div>
        </div>
        {/* <!-- ----------------------END OF MESSAGE------------------ --> */}

        {/* <!-- ----------------------FRIEND REQUESTS------------------ --> */}
        <div className="friend-requests">
          <h4>Requests</h4>
          <div className="request">
            <div className="info">
              <div className="profile-photo">
                <img src="./images/profile-13.jpg" />
              </div>
              <div>
                <h5>Hajia Bintu</h5>
                <p className="text-muted">8 mutual friends</p>
              </div>
            </div>
            <div className="action">
              <button className="btn btn-primary">accepted</button>
              <button className="btn">Decline</button>
            </div>
          </div>
          {/* <!-- Request --> */}
          <div className="request">
            <div className="info">
              <div className="profile-photo">
                <img src="./images/profile-13.jpg" />
              </div>
              <div>
                <h5>Hajia Bintu</h5>
                <p className="text-muted">8 mutual friends</p>
              </div>
            </div>
            <div className="action">
              <button className="btn btn-primary">accepted</button>
              <button className="btn">Decline</button>
            </div>
          </div>
          {/* <!-- Request --> */}
          <div className="request">
            <div className="info">
              <div className="profile-photo">
                <img src="./images/profile-13.jpg" />
              </div>
              <div>
                <h5>Hajia Bintu</h5>
                <p className="text-muted">8 mutual friends</p>
              </div>
            </div>
            <div className="action">
              <button className="btn btn-primary">accepted</button>
              <button className="btn">Decline</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Right;
