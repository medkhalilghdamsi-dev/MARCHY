import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { categories, products } from '../data/products'
import { sellers } from '../data/sellers'
import { useMarketplaceState } from '../hooks/useMarketplaceState'
import { Header, Footer, MobileTabBar } from '../components/MarketplaceChrome'
import { Home, SearchPage, ProductPage, CartPage, CheckoutPage, WishlistPage } from '../pages/ShoppingPages'
import { SellersPage, SellerPage, CategoriesPage } from '../pages/DiscoveryPages'
import { SellerLaunchPage, SellerDashboardPage, SellerPreparationPage, BuyerOrdersPage } from '../pages/SellerPages'
import { AccountPage, AuthPage, MarketplaceGuidePage, HelpCenterPage, NotFoundPage } from '../pages/SupportPages'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App(){
  const location=useLocation()
  const [query,setQuery]=useState('')
  const { language, setLanguage, cart, wishlist, addToCart, updateQty, removeItem, toggleWish, placeDemoOrder } = useMarketplaceState()
  useEffect(()=>{const params=new URLSearchParams(location.search);setQuery(params.get('q')||'')},[location.pathname,location.search])
  useEffect(()=>{
    const path=location.pathname
    const params=new URLSearchParams(location.search)
    const queryTerm=params.get('q')
    let title='Discover local products and stores'
    if(path==='/') title='Discover more, closer to home'
    else if(path==='/search') title=queryTerm?'Search results for '+queryTerm:'Shop the marketplace'
    else if(path.startsWith('/category/')){
      const slug=decodeURIComponent(path.split('/').pop()||'')
      const category=categories.find(item=>item.toLowerCase()===slug.toLowerCase())
      title=category?category+' products':'Category not found'
    }else if(path.startsWith('/product/')){
      const product=products.find(item=>item.id===Number(path.split('/').pop()))
      title=product?product.name:'Product not found'
    }else if(path.startsWith('/seller/')){
      const slug=path.split('/').pop()
      const seller=sellers.find(item=>item.slug===slug)
      title=seller?seller.name:'Seller storefront'
    }else{
      const titles={'/cart':'Shopping cart','/checkout':'Checkout preview','/wishlist':'Saved products','/categories':'Browse categories','/sellers':'Discover sellers','/account':'Your account','/login':'Sign in','/signup':'Create account','/help':'Help centre','/delivery':'Delivery guide','/returns':'Returns guide','/seller-help':'Seller preparation guide','/sell':'Sell on MARCHY','/seller-dashboard':'Seller workspace','/orders':'Order tracking'}
      title=titles[path]||'Page not found'
    }
    document.title=title+' | MARCHY'
  },[location.pathname,location.search])
  return <div className={language==='ar'?'app-root is-rtl':'app-root'} dir={language==='ar'?'rtl':'ltr'}><ScrollToTop/><a className="skip-to-content" href="#main-content">Skip to main content</a><Header cartCount={cart.reduce((s,x)=>s+x.qty,0)} query={query} setQuery={setQuery} language={language} setLanguage={setLanguage}/><Routes><Route path="/" element={<Home addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/search" element={<SearchPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/category/:category" element={<SearchPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/product/:id" element={<ProductPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/cart" element={<CartPage cart={cart} updateQty={updateQty} removeItem={removeItem} language={language}/>}/><Route path="/checkout" element={<CheckoutPage cart={cart} language={language} onPlaceDemoOrder={placeDemoOrder}/>}/><Route path="/wishlist" element={<WishlistPage products={products} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} language={language}/>}/><Route path="/categories" element={<CategoriesPage language={language}/>}/><Route path="/sellers" element={<SellersPage language={language}/>}/><Route path="/seller/:slug" element={<SellerPage language={language} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish}/>}/><Route path="/account" element={<AccountPage cart={cart} wishlist={wishlist} language={language}/>}/><Route path="/login" element={<AuthPage language={language}/>}/><Route path="/signup" element={<AuthPage language={language}/>}/><Route path="/help" element={<HelpCenterPage language={language}/>}/><Route path="/delivery" element={<MarketplaceGuidePage type="delivery" language={language}/>}/><Route path="/returns" element={<MarketplaceGuidePage type="returns" language={language}/>}/><Route path="/seller-help" element={<SellerPreparationPage language={language}/>}/><Route path="/sell" element={<SellerLaunchPage language={language}/>}/><Route path="/seller-dashboard" element={<SellerDashboardPage language={language}/>}/><Route path="/orders" element={<BuyerOrdersPage language={language}/>}/><Route path="*" element={<NotFoundPage language={language}/>}/></Routes><Footer language={language}/><MobileTabBar cartCount={cart.reduce((s,x)=>s+x.qty,0)} wishlistCount={wishlist.length} language={language}/></div>
}

export default App