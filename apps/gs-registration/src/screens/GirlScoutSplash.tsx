import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { Footer } from '../components/Footer'
import splashImg from '../assets/gs-splash-new.jpg'
import './GirlScoutSplash.css'

export function GirlScoutSplash() {
  const navigate = useNavigate()

  return (
    <div className="screen splash-screen">
      <TopNav />

      <div className="splash-body">
        <div className="splash-img-wrap">
          <img src={splashImg} alt="Girls playing outdoors" className="splash-img" />
          <div className="splash-img-overlay">
            <p className="splash-img-watermark">For Illustrative Purposes Only</p>
          </div>
        </div>

        <div className="splash-content">
          <h1 className="screen-title splash-heading">Sign Up to Be a Girl Scout</h1>

          <div className="splash-spacer" />

          <h2 className="splash-subheading">What to Expect as a Girl Scout</h2>

          <div className="splash-spacer" />

          <p className="splash-text">Wondering what Girl Scouts looks like for your family?</p>

          <div className="splash-spacer" />

          <p className="splash-text">
            At Girl Scouts, she'll explore what excites her, build new skills, and grow in confidence — supported by friends, mentors, and a welcoming community that includes the whole family every step of the way.
          </p>

          <div className="splash-spacer" />
          <div className="splash-spacer" />

          <div className="splash-cta">
            <button
              className="splash-join-btn"
              onClick={() => navigate('/register/caregiver-name')}
            >
              Join Now &nbsp;→
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
