import { Link } from 'react-router-dom'
import PublicNav from '../components/layout/PublicNav'
import Footer from '../components/layout/Footer'

const FEAT = [['📄', 'Report Problems', 'Share issues with photos & location'], ['👥', 'Get Support', 'Let your community help and support'], ['📈', 'Track Status', 'Follow the progress of your report'], ['🛡', 'See Impact', 'Build a better community together']]
const CATS = [['🛣', 'Road', 'Potholes, broken roads, traffic issues'], ['💧', 'Water', 'Water leaks, shortage, contamination'], ['🗑', 'Garbage', 'Garbage collection, cleanliness issues'], ['💡', 'Streetlight', 'Faulty lights, power issues'], ['⋯', 'Other', 'Any other community issue']]

export default function Home() {
  return (
    <>
      <PublicNav />
      <section className="hero" id="about">
        <div>
          <h1>Together for a<br /><em>Better Community</em></h1>
          <p>Report local problems, get community support, and track solutions. Make your neighborhood cleaner, safer and better.</p>
          <div className="hero-actions">
            <Link to="/report" className="btn btn-primary">Report a Problem →</Link>
            <Link to="/map" className="btn">🗺 View Reports</Link>
          </div>
        </div>
        <div className="feat">
          {FEAT.map(([i, t, d]) => <div key={t}><span className="ic">{i}</span><b>{t}</b><small>{d}</small></div>)}
        </div>
      </section>
      <h2 className="sec-title" style={{ marginTop: 26 }}>Popular Categories</h2>
      <div className="cats">
        {CATS.map(([i, t, d]) => <div className="card" key={t}><span className="ic">{i}</span><h4>{t}</h4><p>{d}</p></div>)}
      </div>
      <Footer />
    </>
  )
}
