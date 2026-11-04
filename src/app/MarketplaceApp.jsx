import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { categories, products } from '../data/products'
import { sellers } from '../data/sellers'
import { useMarketplaceState } from '../hooks/useMarketplaceState'
import { Header, Footer, MobileTabBar } from '../components/MarketplaceChrome'
import { Home, SearchPage, ProductPage, CartPage, CheckoutPage, WishlistPage } from '../pages/ShoppingPages'
import { SellersPage, SellerPage, CategoriesPage } from '../pages/DiscoveryPages'
import { ComparePage } from '../pages/ComparePage'
import { SellerLaunchPage, SellerDashboardPage, SellerPreparationPage } from '../pages/SellerPages'
import { AccountPage, AuthPage, MarketplaceGuidePage, HelpCenterPage, NotFoundPage } from '../pages/SupportPages'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App(){
  const location=useLocation()
  const [query,setQuery]=useState('')
  const { language, setLanguage, theme, setTheme, cart, wishlist, addToCart, updateQty, removeItem, toggleWish } = useMarketplaceState()
  useEffect(()=>{const params=new URLSearchParams(location.search);setQuery(params.get('q')||'')},[location.pathname,location.search])
  useEffect(()=>{
    const path=location.pathname
    const params=new URLSearchParams(location.search)
    const queryTerm=params.get('q')?.trim()
    let title='Discover local products and stores'
    let description='Explore sample product listings and local storefronts across Tunisia. Compare displayed prices in TND and review details before contacting a seller.'
    if(path==='/'){
      title='Discover more, closer to home'
      description='Discover products and local storefronts across Tunisia on MARCHY. Browse illustrative catalogue listings with prices shown in Tunisian dinars.'
    }else if(path==='/search'){
      title=queryTerm?'Search results for '+queryTerm:'Shop the marketplace'
      description=queryTerm
        ? 'Explore MARCHY sample marketplace results for '+queryTerm+'. Compare displayed prices, browse seller storefronts and review listing details.'
        : 'Browse the MARCHY sample marketplace. Explore products by category, seller location and displayed price in Tunisian dinars.'
    }else if(path.startsWith('/category/')){
      const slug=decodeURIComponent(path.split('/').pop()||'')
      const category=categories.find(item=>item.toLowerCase()===slug.toLowerCase())
      title=category?category+' products':'Category not found'
      description=category
        ? 'Browse illustrative '+category.toLowerCase()+' listings on MARCHY. Compare displayed prices in TND and explore sample seller storefronts.'
        : 'The requested category could not be found in the MARCHY sample catalogue.'
    }else if(path.startsWith('/product/')){
      const product=products.find(item=>item.id===Number(path.split('/').pop()))
      title=product?product.name:'Product not found'
      description=product
        ? 'Explore the MARCHY sample listing for '+product.name+'. Review the displayed price, seller storefront and product details to confirm before ordering.'
        : 'The requested product could not be found in the MARCHY sample catalogue.'
    }else if(path.startsWith('/seller/')){
      const slug=path.split('/').pop()
      const seller=sellers.find(item=>item.slug===slug)
      title=seller?seller.name:'Seller storefront'
      description=seller
        ? 'Explore the demo storefront for '+seller.name+' in '+seller.city+'. Browse its illustrative product listings and review details before contacting the seller.'
        : 'The requested storefront could not be found in the MARCHY sample directory.'
    }else{
      const pages={
        '/compare':['Compare products','Compare sample product prices, descriptions and seller details side by side on MARCHY.'],
        '/cart':['Shopping cart','Review products saved in your MARCHY demo basket and check the displayed seller subtotals.'],
        '/checkout':['Checkout preview','Review a sample checkout journey on MARCHY. No order or payment is submitted.'],
        '/wishlist':['Saved products','Keep sample marketplace listings together in your MARCHY wishlist while you compare options.'],
        '/categories':['Browse categories','Explore the product categories available in the MARCHY sample marketplace.'],
        '/sellers':['Discover sellers','Browse illustrative storefront profiles from across Tunisia on MARCHY.'],
        '/account':['Your account','Review your local MARCHY browsing activity and saved marketplace items.'],
        '/login':['Sign in','Sign-in is a frontend preview in the MARCHY marketplace prototype.'],
        '/signup':['Create account','Account creation is a frontend preview in the MARCHY marketplace prototype.'],
        '/help':['Help centre','Find guidance for browsing the MARCHY sample marketplace.'],
        '/delivery':['Delivery guide','Learn what delivery details to confirm directly with a seller before ordering.'],
        '/returns':['Returns guide','Review the questions to ask a seller about exchanges and returns before ordering.'],
        '/seller-help':['Seller preparation guide','Read the information sellers should prepare before publishing a storefront on MARCHY.'],
        '/sell':['Sell on MARCHY','Explore the seller onboarding preview for the MARCHY marketplace.'],
        '/seller-dashboard':['Seller workspace','Preview the local-only seller workspace in the MARCHY frontend prototype.']
      }
      const page=pages[path]
      title=page?.[0]||'Page not found'
      description=page?.[1]||'The requested page could not be found on MARCHY.'
    }
    document.title=title+' | MARCHY'
    const setMeta=(selector,content,attribute,value)=>{
      let element=document.querySelector(selector)
      if(!element){
        element=document.createElement('meta')
        element.setAttribute(attribute,value)
        document.head.appendChild(element)
      }
      element.setAttribute('content',content)
    }
    setMeta('meta[name="description"]',description,'name','description')
    setMeta('meta[property="og:title"]',title+' | MARCHY','property','og:title')
    setMeta('meta[property="og:description"]',description,'property','og:description')
    setMeta('meta[name="twitter:title"]',title+' | MARCHY','name','twitter:title')
    setMeta('meta[name="twitter:description"]',description,'name','twitter:description')
  },[location.pathname,location.search])
  return <div className={language==='ar'?'app-root is-rtl':'app-root'} dir={language==='ar'?'rtl':'ltr'}><ScrollToTop/><a className="skip-to-content" href="#main-content">Skip to main content</a><Header cartCount={cart.reduce((s,x)=>s+x.qty,0)} query={query} setQuery={setQuery} language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme}/><Routes><Route path="/" element={<Home addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/search" element={<SearchPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/category/:category" element={<SearchPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/product/:id" element={<ProductPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/compare" element={<ComparePage addToCart={addToCart} language={language}/>}/><Route path="/cart" element={<CartPage cart={cart} updateQty={updateQty} removeItem={removeItem} addToCart={addToCart} language={language}/>}/><Route path="/checkout" element={<CheckoutPage cart={cart} language={language}/>}/><Route path="/wishlist" element={<WishlistPage products={products} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} language={language}/>}/><Route path="/categories" element={<CategoriesPage language={language}/>}/><Route path="/sellers" element={<SellersPage language={language}/>}/><Route path="/seller/:slug" element={<SellerPage language={language} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish}/>}/><Route path="/account" element={<AccountPage cart={cart} wishlist={wishlist} language={language}/>}/><Route path="/login" element={<AuthPage language={language}/>}/><Route path="/signup" element={<AuthPage language={language}/>}/><Route path="/help" element={<HelpCenterPage language={language}/>}/><Route path="/delivery" element={<MarketplaceGuidePage type="delivery" language={language}/>}/><Route path="/returns" element={<MarketplaceGuidePage type="returns" language={language}/>}/><Route path="/seller-help" element={<SellerPreparationPage language={language}/>}/><Route path="/sell" element={<SellerLaunchPage language={language}/>}/><Route path="/seller-dashboard" element={<SellerDashboardPage language={language}/>}/><Route path="*" element={<NotFoundPage language={language}/>}/></Routes><Footer language={language}/><MobileTabBar cartCount={cart.reduce((s,x)=>s+x.qty,0)} wishlistCount={wishlist.length} language={language}/></div>
}

export default App