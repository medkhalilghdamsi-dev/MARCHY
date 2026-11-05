import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { translateTree } from '../i18n/translate'

function AuthPage({language}) {
 const location=useLocation()
 const signup=location.pathname==='/signup'
 const [showPassword,setShowPassword]=useState(false)
 const [message,setMessage]=useState('')
 const [form,setForm]=useState({name:'',email:'',password:'',confirm:'',terms:false})
 const update=(key,value)=>{setForm(current=>({...current,[key]:value}));setMessage('')}
 const submit=event=>{
  event.preventDefault()
  if(signup&&form.password!==form.confirm){setMessage('Your passwords do not match.');return}
  setMessage('The form is ready, but account authentication is not connected yet. Your details have not been sent or saved.')
 }
 return translateTree(<main id="main-content" className="auth-page">
  <div className="auth-shell">
   <section className="auth-brand-panel">
    <Link to="/" className="auth-brand"><img src="/favicon.svg" alt="" width="38" height="38"/><b>MARCHY<span>.</span></b></Link>
    <div className="auth-brand-copy"><span className="eyebrow">YOUR MARKETPLACE, YOUR WAY</span><h1>{signup?'A better way to discover.':'Good to see you again.'}</h1><p>{signup?'Create your MARCHY profile and keep your favourite local finds in one place.':'Sign in to pick up where you left off and keep your marketplace activity together.'}</p></div>
    <div className="auth-brand-foot"><span>🇹🇳</span><span>Built around discovering local finds across Tunisia.</span></div>
    <div className="auth-orbit auth-orbit-one"></div><div className="auth-orbit auth-orbit-two"></div>
   </section>
   <section className="auth-form-panel">
    <div className="auth-mobile-brand"><Link to="/" className="auth-brand"><img src="/favicon.svg" alt="" width="34" height="34"/><b>MARCHY<span>.</span></b></Link></div>
    <div className="auth-form-heading"><span className="eyebrow">{signup?'GET STARTED':'WELCOME BACK'}</span><h2>{signup?'Create your account':'Sign in to MARCHY'}</h2><p>{signup?'It only takes a moment to set up your profile.':'Enter your details to access your account.'}</p></div>
    <div className="auth-mode-switch"><Link to="/login" className={!signup?'active':''}>Sign in</Link><Link to="/signup" className={signup?'active':''}>Create account</Link></div>
    <form className="auth-form" onSubmit={submit}>
     {signup&&<label>Full name<input required autoComplete="name" value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Your full name"/></label>}
     <label>Email address<input type="email" required autoComplete="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label>
     <label>Password<span className="auth-password-wrap"><input type={showPassword?'text':'password'} required minLength="8" autoComplete={signup?'new-password':'current-password'} value={form.password} onChange={e=>update('password',e.target.value)} placeholder="At least 8 characters"/><button type="button" onClick={()=>setShowPassword(value=>!value)}>{showPassword?'Hide':'Show'}</button></span></label>
     {signup&&<><label>Confirm password<input type={showPassword?'text':'password'} required minLength="8" autoComplete="new-password" value={form.confirm} onChange={e=>update('confirm',e.target.value)} placeholder="Enter your password again"/></label><label className="auth-terms"><input type="checkbox" required checked={form.terms} onChange={e=>update('terms',e.target.checked)}/> <span>I agree to the <Link to="/help">platform guidelines</Link> and understand this is a preview.</span></label></>}
     {!signup&&<div className="auth-form-meta"><label className="auth-remember"><input type="checkbox"/> Remember me</label><button type="button" className="auth-text-button" onClick={()=>setMessage('Password recovery will be available once authentication is connected.')}>Forgot password?</button></div>}
     <button type="submit" className="primary-btn auth-submit">{signup?'Create account':'Sign in'} <span>→</span></button>
     {message&&<p className="auth-feedback" role="status">{message}</p>}
    </form>
    <p className="auth-demo-note"><span>ⓘ</span> Preview only. Authentication is not connected, and this form does not create an account or transmit personal details.</p>
    <p className="auth-switch-copy">{signup?'Already have an account?':'New to MARCHY?'} <Link to={signup?'/login':'/signup'}>{signup?'Sign in':'Create an account'}</Link></p>
   </section>
  </div>
 </main>,language)
}

export { AuthPage }
