import React from 'react';
import { useNavigate } from 'react-router-dom';
import './404NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
      />
      <main className="not-found-page">
        <div className="back-button-container">
          <button
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Navigate Back to Previous Page"
            title="Navigate Back to Previous Page"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="col-sm-10 col-sm-offset-1 text-center">
                <div className="four_zero_four_bg">
                  <h1>404</h1>
                  <div className="caveman-animation">
                    <div className="caveman">
                      <div className="head">
                        <div className="eye left"></div>
                        <div className="eye right"></div>
                        <div className="mouth"></div>
                      </div>
                      <div className="body"></div>
                      <div className="arm left"></div>
                      <div className="arm right"></div>
                      <div className="leg left"></div>
                      <div className="leg right"></div>
                    </div>
                    <div className="cable">
                      <div className="cable-break"></div>
                    </div>
                  </div>
                </div>
                <div className="contant_box_404">
                  <h3 className="h2">Look like you're lost</h3>
                  <p>The page you are looking for is not available!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}