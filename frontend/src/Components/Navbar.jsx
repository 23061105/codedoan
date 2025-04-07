import React from "react";

const Navbar = () => {
  return (
    <nav>
      <div class="container">
        {/* <!-- LOGO --> */}
        <h2 class="log">nokoSocial</h2>
        <div class="search-bar">
          {/* <!-- ICON SEARCH --> */}
          <i class="uil uil-search"></i>
          <input
            type="search"
            placeholder="Search for creators, inspirations, and projects"
          />
        </div>
        <div class="create">
          <label class="btn btn-primary" for="create">
            Create{" "}
          </label>
          <div class="profile-photo">
            <img src="./images/profile-1.jpg" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
