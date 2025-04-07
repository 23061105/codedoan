import React from 'react'

const Middle = () => {
  return (
    <>
      <div className="middle">
        {/* <!-- --------STORIES--------- --> */}
        <div className="stories">
          <div className="story">
            <div className="profile-photo">
              <img src="./images/profile-8.jpg" alt="" />
            </div>
            <p className="name">Your story</p>
          </div>

          <div className="story">
            <div className="profile-photo">
              <img src="./images/profile-9.jpg" alt="" />
            </div>
            <p className="name">Lilia</p>
          </div>

          <div className="story">
            <div className="profile-photo">
              <img src="./images/profile-10.jpg" alt="" />
            </div>
            <p className="name">Woman</p>
          </div>

          <div className="story">
            <div className="profile-photo">
              <img src="./images/profile-11.jpg" alt="" />
            </div>
            <p className="name">Dog</p>
          </div>

          <div className="story">
            <div className="profile-photo">
              <img src="./images/profile-12.jpg" alt="" />
            </div>
            <p className="name">Cat</p>
          </div>

          <div className="story">
            <div className="profile-photo">
              <img src="./images/profile-13.jpg" alt="" />
            </div>
            <p className="name">james</p>
          </div>
        </div>
        {/* <!-- ------------------END OF STORIES----------------- --> */}
        <form className="create-post">
          <div className="profile-photo">
            <img src="./images/profile-1.jpg" />
          </div>
          <input
            type="text"
            placeholder="What's on your mind, Diana?"
            id="create-post"
          />
          <input type="submit" value="Post" className="btn btn-primary" />
        </form>
        {/* <!-- ----------------Feeds------------------ --> */}
        <div className="feeds">
          {/* <!-- --------------FEED 1---------------- --> */}
          <div className="feed">
            <div className="head">
              <div className="user">
                <div className="profile-photo">
                  <img src="./images/profile-13.jpg" />
                </div>
                <div className="ingo">
                  <h3>Lana Rose</h3>
                  <small>Dubai,15 MINUTES AGO</small>
                </div>
              </div>
              <span className="edit">
                <i className="uil uil-ellipsis-h"></i>
              </span>
            </div>

            <div className="photo">
              <img src="./images/feed-1.jpg" />
            </div>

            <div className="action-button">
              <div className="interaction-buttons">
                <i className="uil uil-thumbs-up"></i>
                <i className="uil uil-comment-alt-dots"></i>
                <i className="uil uil-share-alt"></i>
              </div>
              <div className="bookmark">
                <i className="uil uil-bookmark"></i>
              </div>
            </div>
            <div className="liked-by">
              <span>
                <img src="./images/profile-13.jpg" />
              </span>
              <span>
                <img src="./images/profile-4.jpg" />
              </span>
              <span>
                <img src="./images/profile-15.jpg" />
              </span>
              <p>
                Like by <b>Lam</b> and <b>2,322 others</b>
              </p>
            </div>

            <div className="caption">
              <p>
                <b>Lam</b> Lorem ipsum dolor sit amet.
                <span className="harsh-tag">#lifestyle</span>
              </p>
            </div>
            <div className="comments text-muted">View all 277 comments</div>
          </div>

          <div className="feed">
            <div className="head">
              <div className="user">
                <div className="profile-photo">
                  <img src="./images/profile-13.jpg" />
                </div>
                <div className="ingo">
                  <h3>Lana Rose</h3>
                  <small>Dubai,15 MINUTES AGO</small>
                </div>
              </div>
              <span className="edit">
                <i className="uil uil-ellipsis-h"></i>
              </span>
            </div>

            <div className="photo">
              <img src="./images/feed-1.jpg" />
            </div>

            <div className="action-button">
              <div className="interaction-buttons">
                <i className="uil uil-thumbs-up"></i>
                <i className="uil uil-comment-alt-dots"></i>
                <i className="uil uil-share-alt"></i>
              </div>
              <div className="bookmark">
                <i className="uil uil-bookmark"></i>
              </div>
            </div>
            <div className="liked-by">
              <span>
                <img src="./images/profile-13.jpg" />
              </span>
              <span>
                <img src="./images/profile-4.jpg" />
              </span>
              <span>
                <img src="./images/profile-15.jpg" />
              </span>
              <p>
                Like by <b>Lam</b> and <b>2,322 others</b>
              </p>
            </div>

            <div className="caption">
              <p>
                <b>Lam</b> Lorem ipsum dolor sit amet.
                <span className="harsh-tag">#lifestyle</span>
              </p>
            </div>
            <div className="comments text-muted">View all 277 comments</div>
          </div>

          <div className="feed">
            <div className="head">
              <div className="user">
                <div className="profile-photo">
                  <img src="./images/profile-13.jpg" />
                </div>
                <div className="ingo">
                  <h3>Lana Rose</h3>
                  <small>Dubai,15 MINUTES AGO</small>
                </div>
              </div>
              <span className="edit">
                <i className="uil uil-ellipsis-h"></i>
              </span>
            </div>

            <div className="photo">
              <img src="./images/feed-1.jpg" />
            </div>

            <div className="action-button">
              <div className="interaction-buttons">
                <i className="uil uil-thumbs-up"></i>
                <i className="uil uil-comment-alt-dots"></i>
                <i className="uil uil-share-alt"></i>
              </div>
              <div className="bookmark">
                <i className="uil uil-bookmark"></i>
              </div>
            </div>
            <div className="liked-by">
              <span>
                <img src="./images/profile-13.jpg" />
              </span>
              <span>
                <img src="./images/profile-4.jpg" />
              </span>
              <span>
                <img src="./images/profile-15.jpg" />
              </span>
              <p>
                Like by <b>Lam</b> and <b>2,322 others</b>
              </p>
            </div>

            <div className="caption">
              <p>
                <b>Lam</b> Lorem ipsum dolor sit amet.
                <span className="harsh-tag">#lifestyle</span>
              </p>
            </div>
            <div className="comments text-muted">View all 277 comments</div>
          </div>

          <div className="feed">
            <div className="head">
              <div className="user">
                <div className="profile-photo">
                  <img src="./images/profile-13.jpg" />
                </div>
                <div className="ingo">
                  <h3>Lana Rose</h3>
                  <small>Dubai,15 MINUTES AGO</small>
                </div>
              </div>
              <span className="edit">
                <i className="uil uil-ellipsis-h"></i>
              </span>
            </div>

            <div className="photo">
              <img src="./images/feed-1.jpg" />
            </div>

            <div className="action-button">
              <div className="interaction-buttons">
                <i className="uil uil-thumbs-up"></i>
                <i className="uil uil-comment-alt-dots"></i>
                <i className="uil uil-share-alt"></i>
              </div>
              <div className="bookmark">
                <i className="uil uil-bookmark"></i>
              </div>
            </div>
            <div className="liked-by">
              <span>
                <img src="./images/profile-13.jpg" />
              </span>
              <span>
                <img src="./images/profile-4.jpg" />
              </span>
              <span>
                <img src="./images/profile-15.jpg" />
              </span>
              <p>
                Like by <b>Lam</b> and <b>2,322 others</b>
              </p>
            </div>

            <div className="caption">
              <p>
                <b>Lam</b> Lorem ipsum dolor sit amet.
                <span className="harsh-tag">#lifestyle</span>
              </p>
            </div>
            <div className="comments text-muted">View all 277 comments</div>
          </div>

          <div className="feed">
            <div className="head">
              <div className="user">
                <div className="profile-photo">
                  <img src="./images/profile-13.jpg" />
                </div>
                <div className="ingo">
                  <h3>Lana Rose</h3>
                  <small>Dubai,15 MINUTES AGO</small>
                </div>
              </div>
              <span className="edit">
                <i className="uil uil-ellipsis-h"></i>
              </span>
            </div>

            <div className="photo">
              <img src="./images/feed-1.jpg" />
            </div>

            <div className="action-button">
              <div className="interaction-buttons">
                <i className="uil uil-thumbs-up"></i>
                <i className="uil uil-comment-alt-dots"></i>
                <i className="uil uil-share-alt"></i>
              </div>
              <div className="bookmark">
                <i className="uil uil-bookmark"></i>
              </div>
            </div>
            <div className="liked-by">
              <span>
                <img src="./images/profile-13.jpg" />
              </span>
              <span>
                <img src="./images/profile-4.jpg" />
              </span>
              <span>
                <img src="./images/profile-15.jpg" />
              </span>
              <p>
                Like by <b>Lam</b> and <b>2,322 others</b>
              </p>
            </div>

            <div className="caption">
              <p>
                <b>Lam</b> Lorem ipsum dolor sit amet.
                <span className="harsh-tag">#lifestyle</span>
              </p>
            </div>
            <div className="comments text-muted">View all 277 comments</div>
          </div>

          <div className="feed">
            <div className="head">
              <div className="user">
                <div className="profile-photo">
                  <img src="./images/profile-13.jpg" />
                </div>
                <div className="ingo">
                  <h3>Lana Rose</h3>
                  <small>Dubai,15 MINUTES AGO</small>
                </div>
              </div>
              <span className="edit">
                <i className="uil uil-ellipsis-h"></i>
              </span>
            </div>

            <div className="photo">
              <img src="./images/feed-1.jpg" />
            </div>

            <div className="action-button">
              <div className="interaction-buttons">
                <i className="uil uil-thumbs-up"></i>
                <i className="uil uil-comment-alt-dots"></i>
                <i className="uil uil-share-alt"></i>
              </div>
              <div className="bookmark">
                <i className="uil uil-bookmark"></i>
              </div>
            </div>
            <div className="liked-by">
              <span>
                <img src="./images/profile-13.jpg" />
              </span>
              <span>
                <img src="./images/profile-4.jpg" />
              </span>
              <span>
                <img src="./images/profile-15.jpg" />
              </span>
              <p>
                Like by <b>Lam</b> and <b>2,322 others</b>
              </p>
            </div>

            <div className="caption">
              <p>
                <b>Lam</b> Lorem ipsum dolor sit amet.
                <span className="harsh-tag">#lifestyle</span>
              </p>
            </div>
            <div className="comments text-muted">View all 277 comments</div>
          </div>

          <div className="feed">
            <div className="head">
              <div className="user">
                <div className="profile-photo">
                  <img src="./images/profile-13.jpg" />
                </div>
                <div className="ingo">
                  <h3>Lana Rose</h3>
                  <small>Dubai,15 MINUTES AGO</small>
                </div>
              </div>
              <span className="edit">
                <i className="uil uil-ellipsis-h"></i>
              </span>
            </div>

            <div className="photo">
              <img src="./images/feed-1.jpg" />
            </div>

            <div className="action-button">
              <div className="interaction-buttons">
                <i className="uil uil-thumbs-up"></i>
                <i className="uil uil-comment-alt-dots"></i>
                <i className="uil uil-share-alt"></i>
              </div>
              <div className="bookmark">
                <i className="uil uil-bookmark"></i>
              </div>
            </div>
            <div className="liked-by">
              <span>
                <img src="./images/profile-13.jpg" />
              </span>
              <span>
                <img src="./images/profile-4.jpg" />
              </span>
              <span>
                <img src="./images/profile-15.jpg" />
              </span>
              <p>
                Like by <b>Lam</b> and <b>2,322 others</b>
              </p>
            </div>

            <div className="caption">
              <p>
                <b>Lam</b> Lorem ipsum dolor sit amet.
                <span className="harsh-tag">#lifestyle</span>
              </p>
            </div>
            <div className="comments text-muted">View all 277 comments</div>
          </div>

          {/* <!-- END OF FEED--> */}
        </div>
        {/* <!-- ---------------------END OF FEEDS--------------------------- --> */}
      </div>
    </>
  )
}

export default Middle