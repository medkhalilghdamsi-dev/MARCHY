import { cloneElement, Children, isValidElement, useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { categories, products } from './data/products'

const sellers = [
 {slug:'atlas-tech-tunis',name:'Atlas Tech',city:'Tunis',region:'Tunis',tagline:'Everyday technology, thoughtfully selected.',description:'A demo electronics storefront showcasing how Tunisian specialist sellers can present their catalogue on MARCHY.',categories:['Electronics'],joined:'2025',responseTime:'Demo profile'},
 {slug:'maison-sousse',name:'Maison & Co',city:'Sousse',region:'Sousse',tagline:'Useful pieces for a more comfortable home.',description:'A sample home and living shop profile. Seller details and stock are illustrative.',categories:['Home'],joined:'2025',responseTime:'Demo profile'},
 {slug:'urban-steps-sfax',name:'Urban Steps',city:'Sfax',region:'Sfax',tagline:'Everyday style, made easy.',description:'A sample fashion storefront for independent retailers.',categories:['Fashion'],joined:'2025',responseTime:'Demo profile'},
 {slug:'nour-beauty-tunis',name:'Nour Beauty',city:'Tunis',region:'Tunis',tagline:'Simple essentials for your daily routine.',description:'A sample beauty storefront. Product availability and seller information are not verified.',categories:['Beauty'],joined:'2025',responseTime:'Demo profile'},
 {slug:'daily-essentials-monastir',name:'Daily Essentials',city:'Monastir',region:'Monastir',tagline:'Small essentials for everyday life.',description:'A sample accessories storefront for the MARCHY frontend prototype.',categories:['Accessories','Pets'],joined:'2025',responseTime:'Demo profile'},
 {slug:'active-life-bizerte',name:'Active Life',city:'Bizerte',region:'Bizerte',tagline:'Gear for movement and everyday activity.',description:'A sample sports storefront. This profile is demonstration content only.',categories:['Sports'],joined:'2025',responseTime:'Demo profile'},
 {slug:'souks-frais-tunis',name:'Souks Frais',city:'Tunis',region:'Tunis',tagline:'Fresh finds for the everyday table.',description:'A sample grocery storefront. Food listings are illustrative, not live inventory.',categories:['Groceries'],joined:'2025',responseTime:'Demo profile'},
 {slug:'autocare-sfax',name:'AutoCare',city:'Sfax',region:'Sfax',tagline:'Practical care for your vehicle.',description:'A sample automotive shop profile.',categories:['Automotive'],joined:'2025',responseTime:'Demo profile'},
 {slug:'paper-trail-tunis',name:'Paper Trail',city:'Tunis',region:'Tunis',tagline:'Tools for notes, ideas and creativity.',description:'A sample books and stationery storefront.',categories:['Books'],joined:'2025',responseTime:'Demo profile'},
 {slug:'playbox-sousse',name:'Playbox',city:'Sousse',region:'Sousse',tagline:'Play, learn and explore.',description:'A sample toys and games storefront.',categories:['Toys & Games','Baby & Kids','Garden & DIY'],joined:'2025',responseTime:'Demo profile'}
]
const sellerByCategory = {'Electronics':'atlas-tech-tunis','Home':'maison-sousse','Fashion':'urban-steps-sfax','Beauty':'nour-beauty-tunis','Accessories':'daily-essentials-monastir','Pets':'daily-essentials-monastir','Sports':'active-life-bizerte','Groceries':'souks-frais-tunis','Automotive':'autocare-sfax','Books':'paper-trail-tunis','Toys & Games':'playbox-sousse','Baby & Kids':'playbox-sousse','Garden & DIY':'playbox-sousse'}
const sellerForProduct = product => sellers.find(s => s.slug === sellerByCategory[product.category]) || sellers[0]

const money = value => `${Number(value).toFixed(3)} TND`
const searchSynonyms = {
  headphones: ['headphone','earphones','earbuds','headset','casque','ecouteurs','سماعات'],
  lamp: ['light','lighting','lampe','مصباح'],
  sneakers: ['shoes','trainers','chaussures','حذاء','أحذية'],
  skincare: ['skin care','beauty','soin','عناية بالبشرة'],
  bottle: ['flask','gourde','bouteille','قارورة'],
  keyboard: ['clavier','لوحة مفاتيح'],
  blanket: ['throw','cover','couverture','بطانية'],
  sports: ['fitness','training','sport','رياضة'],
  electronics: ['tech','technology','électronique','electronique','إلكترونيات'],
  fashion: ['clothing','apparel','mode','ملابس'],
  home: ['household','maison','منزل']
}
const normalizeSearchText = value => String(value || '').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const searchTextMatches = (text, query) => {
  const normalized = normalizeSearchText(text)
  const cleanedQuery = normalizeSearchText(query)
  if (!cleanedQuery) return true
  if (normalized.includes(cleanedQuery)) return true
  const words = cleanedQuery.split(/\s+/).filter(Boolean)
  return words.every(word => {
    const variants = [word, ...Object.entries(searchSynonyms).filter(([key, values]) => key === word || values.some(value => normalizeSearchText(value) === word)).flatMap(([key, values]) => [key, ...values].map(normalizeSearchText))]
    return variants.some(variant => normalized.split(' ').some(token => token === variant || token.startsWith(variant) || variant.startsWith(token)))
  })
}
const readText = (key, fallback) => { try { const value = localStorage.getItem(key); return value || fallback } catch { return fallback } }
const readJson = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value ?? fallback } catch { return fallback } }
const writeJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const translations = {
  "MARCHY preview · sample catalogue and illustrative prices":["Aperçu MARCHY · catalogue et prix indicatifs","معاينة مارشي · كتالوج وأسعار توضيحية"],
  "🇹🇳 Tunisia-first":["🇹🇳 Priorité à la Tunisie","🇹🇳 تونس أولاً"],
  "Prices in TND":["Prix en TND","الأسعار بالدينار التونسي"],
  "Toggle menu":["Ouvrir le menu","فتح القائمة"],
  "Search products, brands and local finds…":["Rechercher des produits, marques et bonnes trouvailles…","ابحث عن المنتجات والعلامات التجارية…"],
  "Search products":["Rechercher des produits","ابحث عن المنتجات"],
  "Search":["Rechercher","بحث"],
  "Language":["Langue","اللغة"],
  "Hello, welcome":["Bonjour, bienvenue","مرحباً بك"],
  "Account":["Compte","الحساب"],
  "Your":["Votre","سلتك"],
  "Cart":["Panier","السلة"],
  "Deals of the day":["Offres du jour","عروض اليوم"],
  "Add to cart":["Ajouter au panier","أضف إلى السلة"],
  "Wishlist":["Favoris","المفضلة"],
  "Saved":["Enregistrés","محفوظ"],
  "Your collection":["Votre collection","مجموعتك"],
  "Continue exploring →":["Continuer à explorer →","واصل الاستكشاف ←"],
  "Saved items":["Articles enregistrés","العناصر المحفوظة"],
  "Your saved finds":["Vos trouvailles enregistrées","اكتشافاتك المحفوظة"],
  "Nothing saved yet":["Aucun article enregistré","لا توجد عناصر محفوظة بعد"],
  "Save products you like and they’ll be waiting here.":["Enregistrez les produits qui vous plaisent, ils vous attendront ici.","احفظ المنتجات التي تعجبك وستجدها هنا."],
  "THE TUNISIAN MARKETPLACE":["LA PLACE DE MARCHÉ TUNISIENNE","السوق التونسية"],
  "Find better.":["Trouvez mieux.","اكتشف الأفضل."],
  "Shop local.":["Achetez local.","تسوّق محلياً."],
  "Discover products from sellers across Tunisia. Explore thoughtful finds, compare prices in dinars and shop with confidence.":["Découvrez les produits de vendeurs partout en Tunisie. Comparez les prix en dinars et achetez en toute confiance.","اكتشف منتجات البائعين من مختلف أنحاء تونس، وقارن الأسعار بالدينار وتسوق بثقة."],
  "Explore the marketplace":["Explorer la marketplace","اكتشف السوق"],
  "✓ Tunisian sellers":["✓ Vendeurs tunisiens","✓ بائعون تونسيون"],
  "✓ Prices in TND":["✓ Prix en TND","✓ الأسعار بالدينار"],
  "✓ Simple discovery":["✓ Découverte facile","✓ اكتشاف سهل"],
  "Worth a closer look":["À découvrir de plus près","تستحق الاكتشاف"],
  "New finds added regularly":["De nouvelles trouvailles régulièrement","اكتشافات جديدة باستمرار"],
  "Explore categories":["Explorer les catégories","استكشف الفئات"],
  "One place to discover new finds":["Un seul endroit pour découvrir","مكان واحد لاكتشاف الجديد"],
  "Find local sellers":["Trouver des vendeurs locaux","اعثر على بائعين محليين"],
  "Browse sample seller profiles":["Voir des profils vendeurs de démonstration","تصفح نماذج البائعين"],
  "All sample prices shown in TND":["Tous les prix indicatifs en TND","جميع الأسعار التوضيحية بالدينار"],
  "FIND YOUR NEXT FAVOURITE":["TROUVEZ VOTRE PROCHAIN COUP DE CŒUR","اعثر على اكتشافك القادم"],
  "Shop by category":["Acheter par catégorie","تسوق حسب الفئة"],
  "View all categories →":["Voir toutes les catégories →","عرض جميع الفئات ←"],
  "Explore →":["Explorer →","استكشف ←"],
  "THE MARCHY EDIT":["LA SÉLECTION MARCHY","اختيارات مارشي"],
  "Discover the collection":["Découvrez la sélection","اكتشف المجموعة"],
  "Explore our sample catalogue across everyday categories.":["Explorez notre catalogue de démonstration dans différentes catégories.","استكشف كتالوجنا التجريبي عبر مختلف الفئات."],
  "See all products →":["Voir tous les produits →","عرض جميع المنتجات ←"],
  "MADE FOR THE WAY WE SHOP":["PENSÉ POUR NOS HABITUDES D’ACHAT","مصمم لطريقتنا في التسوق"],
  "Great finds.":["De belles trouvailles.","اكتشافات رائعة."],
  "One place to discover products and independent sellers across Tunisia.":["Un seul endroit pour découvrir des produits et vendeurs indépendants en Tunisie.","مكان واحد لاكتشاف المنتجات والبائعين المستقلين في تونس."],
  "Explore today's deals →":["Voir les offres du jour →","اكتشف عروض اليوم ←"],
  "FOR TUNISIAN BUSINESSES":["POUR LES ENTREPRISES TUNISIENNES","لأصحاب الأعمال التونسيين"],
  "Put your products in front of more people.":["Faites découvrir vos produits au plus grand nombre.","عرّف المزيد من الناس بمنتجاتك."],
  "MARCHY is building a simpler way for local sellers to reach online shoppers.":["MARCHY crée une solution simple pour permettre aux vendeurs locaux de toucher les acheteurs en ligne.","تعمل مارشي على تسهيل وصول البائعين المحليين إلى المتسوقين عبر الإنترنت."],
  "Explore selling on MARCHY →":["Découvrir la vente sur MARCHY →","اكتشف البيع على مارشي ←"],
  "Sample item":["Article exemple","عنصر تجريبي"],
  "Delivery details confirmed by seller":["Détails de livraison confirmés par le vendeur","يؤكد البائع تفاصيل التوصيل"],
  "Electronics":["Électronique","الإلكترونيات"],
  "Groceries":["Épicerie","البقالة"],
  "Automotive":["Automobile","السيارات"],
  "Books":["Livres","الكتب"],
  "Toys & Games":["Jouets et jeux","الألعاب"],
  "Baby & Kids":["Bébé et enfants","الأطفال والرضع"],
  "Pets":["Animaux","الحيوانات الأليفة"],
  "Garden & DIY":["Jardin et bricolage","الحديقة والأعمال اليدوية"],
  "Fashion":["Mode","الأزياء"],
  "Accessories":["Accessoires","الإكسسوارات"],
  "Beauty":["Beauté","الجمال"],
  "Sports":["Sports","الرياضة"],
  "All":["Tout","الكل"],
  "Home":["Maison","المنزل"],
  "Marketplace":["Marketplace","السوق"],
  "SHOP THE MARCHY MARKETPLACE":["ACHETEZ SUR MARCHY","تسوق عبر مارشي"],
  "Find what you’re looking for.":["Trouvez ce que vous cherchez.","اعثر على ما تبحث عنه."],
  "products to explore":["produits à découvrir","منتجات للاستكشاف"],
  "What are you looking for?":["Que recherchez-vous ?","عمّ تبحث؟"],
  "Filters":["Filtres","التصفية"],
  "Clear":["Effacer","مسح"],
  "Category":["Catégorie","الفئة"],
  "Maximum price":["Prix maximum","السعر الأقصى"],
  "More filters will be added as the catalogue grows.":["D’autres filtres seront ajoutés à mesure que le catalogue grandit.","ستتم إضافة المزيد من خيارات التصفية مع توسع الكتالوج."],
  "Showing":["Affichage de","عرض"],
  "results":["résultats","نتيجة"],
  "Sort by":["Trier par","ترتيب حسب"],
  "Featured":["En vedette","مميز"],
  "Price: low to high":["Prix : croissant","السعر: من الأقل للأعلى"],
  "Price: high to low":["Prix : décroissant","السعر: من الأعلى للأقل"],
  "No products found":["Aucun produit trouvé","لم يتم العثور على منتجات"],
  "Try another search or remove a filter.":["Essayez une autre recherche ou retirez un filtre.","جرّب بحثاً آخر أو أزل أحد عوامل التصفية."],
  "Clear filters":["Effacer les filtres","مسح عوامل التصفية"],
  "Product not found":["Produit introuvable","المنتج غير موجود"],
  "Back to marketplace →":["Retour à la marketplace →","العودة إلى السوق ←"],
  "Sold by":["Vendu par","يباع بواسطة"],
  ". Illustrative product listing. Confirm availability, specifications and terms directly with the seller before purchasing.":[". Annonce illustrative. Confirmez la disponibilité, les caractéristiques et les conditions auprès du vendeur avant tout achat.",". إعلان توضيحي. تأكد من التوفر والمواصفات والشروط مباشرة مع البائع قبل الشراء."],
  "Confirm delivery cost and timing with the seller before ordering.":["Confirmez les frais et délais de livraison auprès du vendeur avant de commander.","تأكد من تكلفة وموعد التوصيل مع البائع قبل الطلب."],
  "Add to wishlist":["Ajouter aux favoris","أضف إلى المفضلة"],
  "Prices shown in TND":["Prix affichés en TND","الأسعار بالدينار التونسي"],
  "Seller details visible":["Détails du vendeur visibles","بيانات البائع ظاهرة"],
  "Local marketplace":["Marketplace locale","سوق محلية"],
  "READY WHEN YOU ARE":["PRÊT QUAND VOUS L’ÊTES","جاهز متى أردت"],
  "Your shopping cart":["Votre panier","سلة التسوق"],
  "Continue shopping →":["Continuer vos achats →","مواصلة التسوق ←"],
  "Remove":["Retirer","إزالة"],
  "Order summary":["Récapitulatif de commande","ملخص الطلب"],
  "Subtotal":["Sous-total","المجموع الفرعي"],
  "Delivery":["Livraison","التوصيل"],
  "Confirmed by seller":["Confirmé par le vendeur","يؤكده البائع"],
  "Estimated total":["Total estimé","الإجمالي التقديري"],
  "Checkout coming soon →":["Paiement bientôt disponible →","إتمام الشراء قريباً ←"],
  "Sample storefront: checkout and delivery integrations are not active yet.":["Boutique de démonstration : le paiement et la livraison ne sont pas encore activés.","متجر تجريبي: الدفع والتوصيل غير متاحين بعد."],
  "Your cart is taking a break.":["Votre panier fait une pause.","سلتك تأخذ استراحة."],
  "Find something useful and add it here.":["Trouvez quelque chose d’utile et ajoutez-le ici.","اعثر على شيء مفيد وأضفه هنا."],
  "Start shopping →":["Commencer vos achats →","ابدأ التسوق ←"],
  "EXPLORE MARCHY":["EXPLOREZ MARCHY","استكشف مارشي"],
  "Shop by category.":["Acheter par catégorie.","تسوق حسب الفئة."],
  "Browse the marketplace by what you need.":["Parcourez la marketplace selon vos besoins.","تصفح السوق حسب احتياجاتك."],
  "Explore products →":["Explorer les produits →","استكشف المنتجات ←"],
  "YOUR MARCHY":["VOTRE MARCHY","حسابك في مارشي"],
  "Your account, all in one place.":["Votre compte, au même endroit.","حسابك، كل شيء في مكان واحد."],
  "Account, saved items and order history will connect here when authentication and backend services are added.":["Votre compte, vos favoris et votre historique seront disponibles lorsque l’authentification et le backend seront ajoutés.","سيتم ربط الحساب والمفضلة وسجل الطلبات عند إضافة تسجيل الدخول والخدمات الخلفية."],
  "SELL ON MARCHY":["VENDRE SUR MARCHY","بع على مارشي"],
  "Bring your products to more people.":["Faites connaître vos produits au plus grand nombre.","وصل منتجاتك إلى مزيد من الناس."],
  "Seller onboarding and storefront tools are planned for a later phase. This frontend is currently a visual prototype.":["L’inscription des vendeurs et les outils de boutique sont prévus dans une prochaine phase. Cette interface est actuellement un prototype visuel.","سيتم إضافة تسجيل البائعين وأدوات المتاجر في مرحلة لاحقة. هذه الواجهة حالياً نموذج أولي."],
  "404":["404","404"],
  "We couldn't find that page.":["Cette page est introuvable.","لم نتمكن من العثور على هذه الصفحة."],
  "The page may have moved, or the link may be incorrect.":["La page a peut-être été déplacée ou le lien est incorrect.","ربما تم نقل الصفحة أو أن الرابط غير صحيح."],
  "Discover":["Découvrir","اكتشف"],
  "Categories":["Catégories","الفئات"],
  "Today's deals":["Offres du jour","عروض اليوم"],
  "Help & support":["Aide et assistance","المساعدة والدعم"],
  "For sellers":["Pour les vendeurs","للبائعين"],
  "Sell on MARCHY":["Vendre sur MARCHY","بع على مارشي"],
  "© 2026 MARCHY. All rights reserved.":["© 2026 MARCHY. Tous droits réservés.","© 2026 مارشي. جميع الحقوق محفوظة."],
  "Built for Tunisia.":["Créé pour la Tunisie.","صُنع من أجل تونس."],
  "All locations":["Toutes les villes","كل المواقع"],
  "Name: A to Z":["Nom : A à Z","الاسم: أ إلى ي"],
  "Recently added":["Ajoutés récemment","أضيفت حديثاً"],
  "DISCOVER LOCAL BUSINESSES":["DÉCOUVREZ LES COMMERCES LOCAUX","اكتشف المتاجر المحلية"],
  "Meet the sellers behind the finds.":["Rencontrez les vendeurs derrière vos découvertes.","تعرّف على البائعين وراء اكتشافاتك."],
  "Explore sample storefronts from across Tunisia. Profiles and listings are demonstration content, not verified businesses.":["Explorez des boutiques de démonstration de toute la Tunisie. Les profils et annonces sont fictifs et non vérifiés.","استكشف متاجر تجريبية من مختلف أنحاء تونس. الملفات والإعلانات توضيحية وليست لشركات تم التحقق منها."],
  "Sample storefronts":["Boutiques de démonstration","متاجر تجريبية"],
  "Locations represented":["Villes représentées","المناطق الممثلة"],
  "Sample listings":["Annonces de démonstration","إعلانات تجريبية"],
  "DEMO STOREFRONT":["BOUTIQUE DE DÉMONSTRATION","متجر تجريبي"],
  "View storefront":["Voir la boutique","عرض المتجر"],
  "Storefront not found":["Boutique introuvable","المتجر غير موجود"],
  "Browse sellers →":["Parcourir les vendeurs →","تصفح البائعين ←"],
  "DEMO STOREFRONT · NOT VERIFIED":["BOUTIQUE DE DÉMONSTRATION · NON VÉRIFIÉE","متجر تجريبي · غير موثق"],
  "Seller information requires confirmation":["Les informations du vendeur doivent être confirmées","يجب تأكيد معلومات البائع"],
  "SHOP THIS STOREFRONT":["DÉCOUVRIR CETTE BOUTIQUE","تسوق من هذا المتجر"],
  "Products from ":[ "Produits de ", "منتجات " ],
  "illustrative listings":["annonces indicatives","إعلانات توضيحية"],
  "All sellers →":["Tous les vendeurs →","كل البائعين ←"],
  "No sample listings yet":["Aucune annonce de démonstration pour le moment","لا توجد إعلانات تجريبية بعد"],
  "Browse products":["Parcourir les produits","تصفح المنتجات"],
  "Seller directory":["Annuaire des vendeurs","دليل البائعين"],
  "Hide filters":["Masquer les filtres","إخفاء عوامل التصفية"],
  "Active":["Actifs","نشطة"],
  "All products":["Tous les produits","كل المنتجات"],
  "Show ":[ "Afficher ", "عرض " ],
  " of ":[ " sur ", " من " ],
  "Previous":["Précédent","السابق"],
  "Next":["Suivant","التالي"],
  "Quantity":["Quantité","الكمية"],
  "Decrease quantity":["Diminuer la quantité","تقليل الكمية"],
  "Increase quantity":["Augmenter la quantité","زيادة الكمية"],
  "PRODUCT OVERVIEW":["APERÇU DU PRODUIT","نظرة عامة على المنتج"],
  "About this listing":["À propos de cette annonce","حول هذا الإعلان"],
  "Seller location":["Localisation du vendeur","موقع البائع"],
  "Price display":["Affichage du prix","عرض السعر"],
  "Listing status":["Statut de l’annonce","حالة الإعلان"],
  "KEEP EXPLORING":["CONTINUEZ À EXPLORER","واصل الاستكشاف"],
  "More in ":[ "Plus dans ", "المزيد في " ],
  "View category →":["Voir la catégorie →","عرض الفئة ←"],
  "Illustrative previous price: ":[ "Ancien prix indicatif : ", "السعر السابق التوضيحي: " ],
  "Product image supplied for this illustrative listing":["Image fournie pour cette annonce illustrative","صورة مقدمة لهذا الإعلان التوضيحي"],
  "This is a sample product listing, not confirmed live inventory. Confirm the product condition, specifications, availability and terms directly with the seller.":["Cette annonce est un exemple et ne représente pas un stock confirmé. Vérifiez l’état, les caractéristiques, la disponibilité et les conditions auprès du vendeur.","هذا إعلان تجريبي وليس مخزوناً مؤكداً. تحقق من حالة المنتج ومواصفاته وتوفره وشروطه مباشرة مع البائع."],
  "MARCHY is currently a frontend demonstration. No purchase, payment or delivery booking is made here.":["MARCHY est actuellement une démonstration frontend. Aucun achat, paiement ou réservation de livraison n’est effectué ici.","مارشي حالياً نموذج واجهة أمامية. لا يتم شراء أو دفع أو حجز توصيل هنا."],
  "This listing is part of the MARCHY sample catalogue. Product details, seller information, price and availability must be confirmed before any transaction.":["Cette annonce fait partie du catalogue de démonstration MARCHY. Les détails, le vendeur, le prix et la disponibilité doivent être confirmés avant toute transaction.","هذا الإعلان جزء من كتالوج مارشي التجريبي. يجب تأكيد التفاصيل ومعلومات البائع والسعر والتوفر قبل أي معاملة."],
  "Tunisian dinar (TND)":["Dinar tunisien (TND)","الدينار التونسي (TND)"],
  "Demonstration content":["Contenu de démonstration","محتوى تجريبي"],
  "Items (" :["Articles (","العناصر ("],
  "Review checkout →":["Aperçu du paiement →","معاينة إتمام الطلب ←"],
  "Checkout preview only":["Aperçu du paiement uniquement","معاينة فقط لإتمام الطلب"],
  "This prototype does not submit orders or collect personal or payment details. Seller availability, delivery and final totals must be confirmed directly.":["Ce prototype ne passe aucune commande et ne collecte aucune donnée personnelle ou bancaire. La disponibilité, la livraison et le total doivent être confirmés directement.","هذا النموذج لا يرسل الطلبات ولا يجمع بيانات شخصية أو مالية. يجب تأكيد التوفر والتوصيل والمجموع النهائي مباشرة."],
  "Close preview":["Fermer l’aperçu","إغلاق المعاينة"],
  "No payment is taken and no order is placed.":["Aucun paiement n’est prélevé et aucune commande n’est passée.","لا يتم تحصيل أي مبلغ ولا تقديم أي طلب."],
  "Everything worth finding.":["Tout ce qui vaut la peine d’être trouvé.","كل ما يستحق الاكتشاف."],
  "Closer to home.":["Plus près de chez vous.","أقرب إليك."],
  "Explore everyday essentials, useful finds and independent storefronts from across Tunisia — all in one place.":["Découvrez les essentiels du quotidien, des trouvailles utiles et des boutiques indépendantes de toute la Tunisie — au même endroit.","اكتشف أساسيات الحياة اليومية والمنتجات المفيدة والمتاجر المستقلة من مختلف أنحاء تونس — في مكان واحد."],
  "Browse categories":["Parcourir les catégories","تصفح الفئات"],
  "Prices displayed in TND":["Prix affichés en TND","الأسعار بالدينار التونسي"],
  "Browse by category":["Parcourir par catégorie","تصفح حسب الفئة"],
  "Discover local storefronts":["Découvrir les boutiques locales","اكتشف المتاجر المحلية"],
  "Browse with ease":["Parcourez facilement","تصفح بسهولة"],
  "Explore products across everyday categories":["Explorez les produits de différentes catégories","استكشف المنتجات من مختلف الفئات"],
  "Find local storefronts":["Trouver des boutiques locales","اعثر على المتاجر المحلية"],
  "See sample seller profiles and locations":["Voir des profils vendeurs et des emplacements de démonstration","شاهد نماذج ملفات البائعين ومواقعهم"],
  "Compare in dinars":["Comparer en dinars","قارن بالدينار"],
  "All catalogue prices shown in TND":["Tous les prix du catalogue sont affichés en TND","جميع أسعار الكتالوج بالدينار التونسي"],
  "START WITH WHAT YOU NEED":["COMMENCEZ PAR VOS BESOINS","ابدأ بما تحتاجه"],
  "Explore all categories":["Explorer toutes les catégories","استكشف جميع الفئات"],
  "A quick route to the things you shop for most.":["Accédez rapidement aux catégories que vous recherchez le plus.","طريق سريع إلى الفئات التي تتسوق منها غالباً."],
  "All categories →":["Toutes les catégories →","جميع الفئات ←"],
  "sample":["exemple","تجريبي"],
  "listing":["annonce","إعلان"],
  "listings":["annonces","إعلانات"],
  "PICK YOUR NEXT DISCOVERY":["CHOISISSEZ VOTRE PROCHAINE TROUVAILLE","اختر اكتشافك القادم"],
  "Popular in the catalogue":["Populaires dans le catalogue","الأكثر شيوعاً في الكتالوج"],
  "A curated look at the current sample listings.":["Un aperçu sélectionné des annonces de démonstration actuelles.","نظرة مختارة على الإعلانات التجريبية الحالية."],
  "Browse all products →":["Parcourir tous les produits →","تصفح جميع المنتجات ←"],
  "Filter featured products":["Filtrer les produits à la une","تصفية المنتجات المميزة"],
  "PRICE COMPARISON":["COMPARAISON DES PRIX","مقارنة الأسعار"],
  "Listings with sample discounts":["Annonces avec réductions indicatives","إعلانات بخصومات توضيحية"],
  "Previous prices are illustrative and must be confirmed with the seller.":["Les anciens prix sont indicatifs et doivent être confirmés auprès du vendeur.","الأسعار السابقة توضيحية ويجب تأكيدها مع البائع."],
  "See all deals →":["Voir toutes les offres →","عرض جميع العروض ←"],
  "DISCOVER THE PEOPLE BEHIND THE PRODUCTS":["DÉCOUVREZ LES VENDEURS DERRIÈRE LES PRODUITS","اكتشف البائعين وراء المنتجات"],
  "Find a storefront.":["Trouvez une boutique.","اعثر على متجر."],
  "Explore what they offer.":["Découvrez leurs produits.","اكتشف ما يقدمونه."],
  "Browse sample shop profiles from Tunis, Sousse, Sfax and other locations.":["Parcourez des profils de boutiques de démonstration à Tunis, Sousse, Sfax et ailleurs.","تصفح نماذج متاجر تجريبية من تونس وسوسة وصفاقس ومناطق أخرى."],
  "Explore seller directory →":["Explorer l’annuaire des vendeurs →","استكشف دليل البائعين ←"],
  "sample storefronts":["boutiques de démonstration","متاجر تجريبية"],
  "everyday categories":["catégories du quotidien","فئات يومية"],
  "Want to sell on MARCHY?":["Vous souhaitez vendre sur MARCHY ?","هل تريد البيع على مارشي؟"],
  "Explore the seller information page and follow the product as onboarding tools take shape.":["Consultez les informations vendeurs pendant la préparation des outils d’inscription.","اطلع على معلومات البائعين مع تطوير أدوات التسجيل."],
  "Learn about selling →":["En savoir plus sur la vente →","تعرف على البيع ←"],
  "MARCHY is a frontend prototype. Product listings, storefronts, prices, discounts and availability shown here are illustrative — not verified live offers.":["MARCHY est un prototype frontend. Les annonces, boutiques, prix, réductions et disponibilités présentés sont indicatifs et non vérifiés.","مارشي نموذج واجهة أمامية. الإعلانات والمتاجر والأسعار والخصومات والتوفر المعروض توضيحي وغير مؤكد."],
  "SAMPLE":["EXEMPLE","عينة"],
  "Added to cart ✓":["Ajouté au panier ✓","أُضيف إلى السلة ✓"],
  "Category not found":["Catégorie introuvable","الفئة غير موجودة"],
  "This category does not exist in the MARCHY catalogue.":["Cette catégorie n’existe pas dans le catalogue MARCHY.","هذه الفئة غير موجودة في كتالوج مارشي."],
  "Browse all categories →":["Parcourir toutes les catégories →","تصفح جميع الفئات ←"],
  "EXPLORE THIS CATEGORY":["EXPLOREZ CETTE CATÉGORIE","استكشف هذه الفئة"],
  "Browse products in this category.":["Parcourez les produits de cette catégorie.","تصفح منتجات هذه الفئة."],
  "Browse sample listings, compare displayed prices and visit demo storefronts.":["Parcourez les annonces de démonstration, comparez les prix affichés et visitez les boutiques de démonstration.","تصفح الإعلانات التجريبية وقارن الأسعار المعروضة وزر المتاجر التجريبية."],
  "Find your category.":["Trouvez votre catégorie.","اعثر على فئتك."],
  "Browse the catalogue by what you need. Every category opens a dedicated product results view.":["Parcourez le catalogue selon vos besoins. Chaque catégorie ouvre une page dédiée de résultats produits.","تصفح الكتالوج حسب احتياجاتك. تفتح كل فئة صفحة مخصصة لنتائج المنتجات."],
  "Not sure where to start?":["Vous ne savez pas par où commencer ?","لا تعرف من أين تبدأ؟"],
  "Browse the full sample catalogue and use filters to narrow your search.":["Parcourez le catalogue de démonstration et utilisez les filtres pour affiner votre recherche.","تصفح الكتالوج التجريبي واستخدم عوامل التصفية لتضييق البحث."],
  "Explore all products →":["Explorer tous les produits →","استكشف جميع المنتجات ←"],
  "Contact us":["Nous contacter","اتصل بنا"],
  "Delivery information":["Informations de livraison","معلومات التوصيل"],
  "Returns & refunds":["Retours et remboursements","الإرجاع واسترداد الأموال"],
  "Seller help":["Aide aux vendeurs","مساعدة البائعين"],
  "HELP & SUPPORT":["AIDE ET ASSISTANCE","المساعدة والدعم"],
  "How can we help?":["Comment pouvons-nous vous aider ?","كيف يمكننا مساعدتك؟"],
  "MARCHY support channels will be published when the marketplace is ready to accept customers. This prototype does not process support requests.":["Les moyens de contacter MARCHY seront publiés lorsque la marketplace sera prête. Ce prototype ne traite pas les demandes d’assistance.","سيتم نشر قنوات دعم مارشي عندما يصبح السوق جاهزاً لاستقبال العملاء. هذا النموذج لا يعالج طلبات الدعم."],
  "DELIVERY INFORMATION":["INFORMATIONS DE LIVRAISON","معلومات التوصيل"],
  "Delivery details are confirmed by each seller.":["Les détails de livraison sont confirmés par chaque vendeur.","يؤكد كل بائع تفاصيل التوصيل."],
  "Delivery coverage, fees and timing are not connected to live seller systems yet. Confirm these details directly with the seller before ordering.":["La couverture, les frais et les délais de livraison ne sont pas encore reliés aux systèmes des vendeurs. Confirmez ces détails directement avant de commander.","لم يتم ربط نطاق التوصيل والرسوم والمواعيد بأنظمة البائعين بعد. أكد هذه التفاصيل مباشرة مع البائع قبل الطلب."],
  "RETURNS & REFUNDS":["RETOURS ET REMBOURSEMENTS","الإرجاع واسترداد الأموال"],
  "Returns information is not active yet.":["Les informations sur les retours ne sont pas encore disponibles.","معلومات الإرجاع غير متاحة بعد."],
  "MARCHY has not launched transaction or returns processing. Agree return terms directly with the seller before any purchase.":["MARCHY n’a pas encore lancé le traitement des transactions ou des retours. Convenez des conditions directement avec le vendeur avant tout achat.","لم تطلق مارشي معالجة المعاملات أو المرتجعات بعد. اتفق على شروط الإرجاع مباشرة مع البائع قبل الشراء."],
  "SELLER HELP":["AIDE AUX VENDEURS","مساعدة البائعين"],
  "Seller tools are coming later.":["Les outils vendeurs arriveront plus tard.","أدوات البائعين قادمة لاحقاً."],
  "Seller onboarding, listing management and support tools are not connected in this frontend prototype.":["L’inscription des vendeurs, la gestion des annonces et les outils d’assistance ne sont pas connectés dans ce prototype frontend.","لم يتم ربط تسجيل البائعين وإدارة الإعلانات وأدوات الدعم في هذا النموذج الأولي."]
  ,"Product details":["Détails du produit","تفاصيل المنتج"]
  ,"Before you order":["Avant de commander","قبل الطلب"]
  ,"Confirm these details with the seller":["Confirmez ces détails auprès du vendeur","تأكد من هذه التفاصيل مع البائع"]
  ,"Product condition and included items":["État du produit et éléments inclus","حالة المنتج والعناصر المرفقة"]
  ,"Current availability and final price":["Disponibilité actuelle et prix final","التوفر الحالي والسعر النهائي"]
  ,"Delivery cost, coverage and timing":["Coût, zone et délai de livraison","تكلفة التوصيل ونطاقه وموعده"]
  ,"Returns, exchanges and warranty terms":["Conditions de retour, d’échange et de garantie","شروط الإرجاع والاستبدال والضمان"]
  ,"Seller storefront":["Boutique du vendeur","متجر البائع"]
  ,"View seller":["Voir le vendeur","عرض البائع"]
  ,"Sample listing":["Annonce de démonstration","عرض تجريبي"]
  ,"Availability to be confirmed":["Disponibilité à confirmer","يجب تأكيد التوفر"]
  ,"Save for later":["Enregistrer pour plus tard","احفظه لوقت لاحق"]
  ,"Remove from saved items":["Retirer des favoris","إزالة من المحفوظات"]
  ,"More from this category":["Plus dans cette catégorie","المزيد من هذه الفئة"]
  ,"Browse category":["Parcourir la catégorie","تصفح الفئة"]
  ,"No product information has been supplied for this sample listing. Contact the seller to confirm the exact product, condition, specifications and what is included.":["Aucune information produit n’a été fournie pour cette annonce de démonstration. Contactez le vendeur pour confirmer le produit, son état, ses caractéristiques et les éléments inclus.","لم يتم توفير معلومات عن المنتج في هذا العرض التجريبي. تواصل مع البائع لتأكيد المنتج وحالته ومواصفاته والعناصر المرفقة."]
  ,"This is not live stock information.":["Il ne s’agit pas d’informations de stock en temps réel.","هذه ليست معلومات مخزون مباشرة."]
  ,"Displayed in Tunisian dinars (TND). Final price and availability must be confirmed with the seller.":["Affiché en dinars tunisiens (TND). Le prix final et la disponibilité doivent être confirmés auprès du vendeur.","السعر معروض بالدينار التونسي. يجب تأكيد السعر النهائي والتوفر مع البائع."]
  ,"Ask the seller about delivery coverage, cost and estimated timing before placing an order.":["Demandez au vendeur la zone, le coût et le délai estimé de livraison avant de commander.","اسأل البائع عن نطاق التوصيل وتكلفته والمدة المتوقعة قبل الطلب."]
  ,"Frontend demonstration only. No order, payment or delivery booking is submitted.":["Démonstration frontend uniquement. Aucune commande, aucun paiement ni réservation de livraison n’est effectué.","واجهة تجريبية فقط. لا يتم إرسال طلب أو دفع أو حجز توصيل."]
  ,"Added to your demo cart. You can review it whenever you're ready.":["Ajouté à votre panier de démonstration. Vous pouvez le consulter à tout moment.","تمت الإضافة إلى سلة العرض التجريبية. يمكنك مراجعتها في أي وقت."]
  ,"Price":["Prix","السعر"]

  ,"Clear all":["Tout effacer","مسح الكل"]
  ,"Deals only":["Offres uniquement","العروض فقط"]
  ,"Up to":["Jusqu’à","حتى"]
  ,"Sort products":["Trier les produits","ترتيب المنتجات"]

  ,"Your MARCHY basket":["Votre panier MARCHY","سلة مشترياتك في مارشي"]
  ,"Items in your cart":["Articles dans votre panier","المنتجات في سلتك"]
  ,"product":["produit","منتج"]
  ,"products":["produits","منتجات"]
  ,"sellers":["vendeurs","بائعين"]
  ,"each":["l’unité","للوحدة"]
  ,"Remove item":["Supprimer l’article","إزالة المنتج"]
  ,"Quantity":["Quantité","الكمية"]
  ,"Need something else?":["Besoin d’autre chose ?","هل تبحث عن شيء آخر؟"]
  ,"Explore all categories":["Explorer toutes les catégories","استكشف جميع الفئات"]
  ,"Your order":["Votre commande","طلبك"]
  ,"Products subtotal":["Sous-total des produits","المجموع الفرعي للمنتجات"]
  ,"To be confirmed":["À confirmer","يجب التأكيد"]
  ,"Discounts":["Réductions","الخصومات"]
  ,"Estimated product total":["Total estimé des produits","إجمالي المنتجات التقديري"]
  ,"Delivery charges, availability and final prices are not yet connected to live seller systems. They are not included in this estimate.":["Les frais de livraison, la disponibilité et les prix finaux ne sont pas encore reliés aux systèmes des vendeurs. Ils ne sont pas inclus dans cette estimation.","لم يتم ربط رسوم التوصيل والتوفر والأسعار النهائية بأنظمة البائعين بعد. وهي غير مشمولة في هذا التقدير."]
  ,"Review checkout":["Vérifier la commande","مراجعة إتمام الطلب"]
  ,"Checkout preview":["Aperçu de commande","معاينة إتمام الطلب"]
  ,"In a live marketplace, the next step would confirm each seller's stock, delivery and final payable amount.":["Sur une marketplace active, l’étape suivante confirmerait le stock, la livraison et le montant final auprès de chaque vendeur.","في السوق الفعلي، ستؤكد الخطوة التالية المخزون والتوصيل والمبلغ النهائي مع كل بائع."]
  ,"A fresh start":["Un nouveau départ","بداية جديدة"]
  ,"Your cart is empty":["Votre panier est vide","سلتك فارغة"]
  ,"Explore products":["Explorer les produits","استكشف المنتجات"]
  ,"Browse categories":["Parcourir les catégories","تصفح الفئات"]

  ,"Your personal collection":["Votre collection personnelle","مجموعتك الشخصية"]
  ,"Keep the products you're considering in one place.":["Gardez les produits que vous envisagez au même endroit.","احتفظ بالمنتجات التي تفكر فيها في مكان واحد."]
  ,"saved products":["produits enregistrés","منتجات محفوظة"]
  ,"Your shortlist":["Votre sélection","قائمتك المختصرة"]
  ,"categories":["catégories","فئات"]
  ,"Discover more products":["Découvrir plus de produits","اكتشف المزيد من المنتجات"]
  ,"Your saved list stays on this device in this demo. It is not synced between devices or accounts.":["Dans cette démonstration, votre liste reste sur cet appareil. Elle n’est pas synchronisée entre appareils ou comptes.","في هذا العرض، تبقى قائمتك محفوظة على هذا الجهاز فقط، ولا تتم مزامنتها بين الأجهزة أو الحسابات."]
  ,"Your next find is out there":["Votre prochaine trouvaille vous attend","اكتشافك القادم بانتظارك"]
  ,"No saved products yet":["Aucun produit enregistré pour le moment","لا توجد منتجات محفوظة بعد"]
  ,"Tap the heart on any product to save it here while you compare your options.":["Appuyez sur le cœur d’un produit pour l’enregistrer ici et comparer vos options.","اضغط على رمز القلب في أي منتج لحفظه هنا ومقارنة الخيارات."]


};
Object.assign(translations, {
 "Guest browsing":["Navigation en tant qu’invité","التصفح كضيف"],
 "You're exploring without signing in":["Vous explorez sans vous connecter","أنت تتصفح دون تسجيل الدخول"],
 "PREVIEW MODE":["MODE APERÇU","وضع المعاينة"],
 "YOUR BASKET":["VOTRE PANIER","سلتك"],
 "Items in cart":["Articles dans le panier","عناصر في السلة"],
 "SAVED COLLECTION":["COLLECTION ENREGISTRÉE","المجموعة المحفوظة"],
 "Saved products":["Produits enregistrés","المنتجات المحفوظة"],
 "DISCOVER LOCAL":["DÉCOUVRIR LOCAL","اكتشف المحلي"],
 "Sample storefronts":["Boutiques de démonstration","متاجر تجريبية"],
 "YOUR SHORTLIST":["VOTRE SÉLECTION","قائمتك المختصرة"],
 "Recently saved":["Enregistrés récemment","المحفوظة مؤخراً"],
 "View all →":["Tout afficher →","عرض الكل ←"],
 "Your shortlist is empty":["Votre sélection est vide","قائمتك فارغة"],
 "Save products with the heart button and they'll appear here.":["Enregistrez des produits avec le bouton cœur pour les retrouver ici.","احفظ المنتجات بزر القلب لتظهر هنا."],
 "Explore products →":["Explorer les produits →","استكشف المنتجات ←"],
 "ACCOUNT ACTIVITY":["ACTIVITÉ DU COMPTE","نشاط الحساب"],
 "Orders & returns":["Commandes et retours","الطلبات والإرجاع"],
 "No order history yet":["Aucun historique de commande","لا يوجد سجل طلبات بعد"],
 "Order tracking and returns aren't active in this frontend prototype. Your demo cart does not create an order.":["Le suivi des commandes et les retours ne sont pas actifs dans ce prototype. Votre panier de démonstration ne crée aucune commande.","تتبع الطلبات والإرجاع غير متاحين في هذا النموذج. سلة المعاينة لا تنشئ طلباً."],
 "Visit help centre →":["Visiter le centre d’aide →","زيارة مركز المساعدة ←"],
 "QUICK LINKS":["LIENS RAPIDES","روابط سريعة"],
 "Explore MARCHY":["Explorer MARCHY","استكشف مارشي"],
 "Browse categories":["Parcourir les catégories","تصفح الفئات"],
 "Delivery information":["Informations de livraison","معلومات التوصيل"],
 "Returns information":["Informations sur les retours","معلومات الإرجاع"],
 "Skip to main content":["Passer au contenu principal","انتقل إلى المحتوى الرئيسي"],
 "Answers before you shop.":["Des réponses avant vos achats.","إجابات قبل التسوق."],
 "FREQUENTLY ASKED QUESTIONS":["QUESTIONS FRÉQUENTES","الأسئلة الشائعة"],
 "Good to know":["Bon à savoir","من الجيد معرفته"],
 "Are the product prices and discounts live?":["Les prix et réductions des produits sont-ils réels ?","هل أسعار المنتجات والخصومات فعلية؟"],
 "Can I place an order or pay on MARCHY?":["Puis-je commander ou payer sur MARCHY ?","هل يمكنني الطلب أو الدفع على مارشي؟"],
 "How can I confirm a product before buying?":["Comment confirmer les détails d’un produit avant l’achat ?","كيف أتأكد من تفاصيل المنتج قبل الشراء؟"],
 "Are the storefronts verified?":["Les boutiques sont-elles vérifiées ?","هل المتاجر موثقة؟"],
 "How do delivery and returns work?":["Comment fonctionnent la livraison et les retours ?","كيف يعمل التوصيل والإرجاع؟"],
 "Can I register as a seller?":["Puis-je m’inscrire comme vendeur ?","هل يمكنني التسجيل كبائع؟"],
 "HELP TOPICS":["SUJETS D’AIDE","مواضيع المساعدة"],
 "Find the right information.":["Trouvez la bonne information.","اعثر على المعلومات المناسبة."],
 "Seller preparation":["Préparation des vendeurs","إعداد البائعين"],
 "Platform status":["État de la plateforme","حالة المنصة"],
 "Delivery, clearly agreed.":["Une livraison clairement convenue.","توصيل بشروط واضحة."],
 "Know the return terms first.":["Connaissez d’abord les conditions de retour.","اعرف شروط الإرجاع أولاً."],
 "BUYER CHECKLIST":["LISTE DE CONTRÔLE ACHETEUR","قائمة تحقق المشتري"],
 "What to confirm before delivery":["À confirmer avant la livraison","ما يجب تأكيده قبل التوصيل"],
 "What to agree before you buy":["À convenir avant l’achat","ما يجب الاتفاق عليه قبل الشراء"],
 "Delivery coverage":["Zone de livraison","منطقة التوصيل"],
 "Total delivery cost":["Coût total de livraison","إجمالي تكلفة التوصيل"],
 "Estimated timing":["Délai estimé","المدة المتوقعة"],
 "Handover and inspection":["Remise et inspection","التسليم والفحص"],
 "Eligible return reasons":["Motifs de retour acceptés","أسباب الإرجاع المقبولة"],
 "Time limits":["Délais","الآجال"],
 "Item condition":["État de l’article","حالة المنتج"],
 "Costs and refund method":["Frais et mode de remboursement","التكاليف وطريقة الاسترداد"],
 "This feature isn't active yet.":["Cette fonctionnalité n’est pas encore active.","هذه الميزة غير مفعلة بعد."],
 "Before any real purchase":["Avant tout achat réel","قبل أي عملية شراء فعلية"],
 "Check the product and seller details.":["Vérifiez les détails du produit et du vendeur.","تحقق من تفاصيل المنتج والبائع."],
 "Find a storefront":["Trouver une boutique","اعثر على متجر"],
 "Quick view":["Aperçu rapide","عرض سريع"],
 "QUICK PRODUCT VIEW · SAMPLE LISTING":["APERÇU RAPIDE · ANNONCE EXEMPLE","عرض سريع · إعلان تجريبي"],
 "Add to demo cart":["Ajouter au panier de démonstration","أضف إلى سلة المعاينة"],
 "View full details →":["Voir tous les détails →","عرض التفاصيل كاملة ←"],
 "Close quick view":["Fermer l’aperçu rapide","إغلاق العرض السريع"],
 "Search shops, products or locations":["Rechercher des boutiques, produits ou lieux","ابحث عن المتاجر والمنتجات والمناطق"],
 "No matching storefronts":["Aucune boutique correspondante","لا توجد متاجر مطابقة"],
 "Clear seller filters":["Effacer les filtres vendeurs","مسح فلاتر البائعين"]
});
function translateText(value, lang) {
  const trimmed = value.trim();
  const entry = translations[trimmed];
  if (!entry || lang === "en") return value;
  return value.replace(trimmed, entry[lang === "fr" ? 0 : 1]);
}
function translateTree(node, lang) {
  if (typeof node === "string") return translateText(node, lang);
  if (Array.isArray(node)) return node.map(child => translateTree(child, lang));
  if (!isValidElement(node)) return node;
  const props = {...node.props};
  if (props.children !== undefined) props.children = Children.map(props.children, child => translateTree(child, lang));
  for (const attr of ["placeholder", "aria-label", "title"]) if (typeof props[attr] === "string") props[attr] = translateText(props[attr], lang);
  return cloneElement(node, props);
}


function Header({ cartCount, query, setQuery, language, setLanguage }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const searchTerm=query.trim()
  const searchMatches=useMemo(()=>searchTerm?products.filter(p=>searchTextMatches([p.name,p.category,p.seller,sellerForProduct(p).name,sellerForProduct(p).city].join(' '),searchTerm)).slice(0,4):[],[searchTerm])
  const categoryMatches=useMemo(()=>searchTerm?categories.filter(c=>c!=='All'&&searchTextMatches(c,searchTerm)).slice(0,3):[],[searchTerm])
  function submit(e) { e.preventDefault(); setSearchOpen(false); navigate(query.trim() ? `/search?q=${encodeURIComponent(query)}` : '/search') }
  return translateTree(<>
    <div className="topline"><div className="shell topline-inner"><span>MARCHY preview · sample catalogue and illustrative prices</span><div><span>🇹🇳 Tunisia-first</span><span className="top-sep">·</span><span>Prices in TND</span></div></div></div>
    <header className="header"><div className="shell header-main">
      <button type="button" className="mobile-menu icon-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu" aria-expanded={menuOpen} aria-controls="primary-navigation">{menuOpen ? "×" : "☰"}</button>
      <Link to="/" className="logo">MARCHY<span>.</span></Link>
      <form className="searchbar" onSubmit={submit} role="search"><span className="search-symbol">⌕</span><input value={query} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==='Escape')setSearchOpen(false)}} onChange={e => {setQuery(e.target.value);setSearchOpen(true)}} placeholder="Search products, brands and local finds…" aria-label="Search products" aria-expanded={searchOpen} aria-controls="global-search-suggestions" /><button type="submit">Search</button>
        {searchOpen&&<div className="global-search-suggestions" id="global-search-suggestions">
          {searchTerm?<><div className="search-suggestion-heading">Matching products</div>{searchMatches.length?searchMatches.map(p=><Link key={p.id} to={`/product/${p.id}`} onMouseDown={()=>setSearchOpen(false)}><span className="suggestion-thumb"><img src={p.image} alt=""/></span><span className="suggestion-copy"><b>{p.name}</b><small>{p.category} · {money(p.price)}</small></span><span className="suggestion-arrow">↗</span></Link>):<p className="suggestion-empty">No matching sample products. Press Search to view results.</p>}{categoryMatches.length>0&&<><div className="search-suggestion-heading">Categories</div>{categoryMatches.map(name=><Link className="category-suggestion" key={name} to={`/category/${encodeURIComponent(name.toLowerCase())}`} onMouseDown={()=>setSearchOpen(false)}><span>▦</span>{name}<span className="suggestion-arrow">→</span></Link>)}</>}</>:<div className="search-suggestion-empty"><b>Start with a category</b><div>{categories.slice(1,5).map(name=><Link key={name} to={`/category/${encodeURIComponent(name.toLowerCase())}`} onMouseDown={()=>setSearchOpen(false)}>{name}</Link>)}</div></div>}
          <button type="button" className="search-suggestion-close" onClick={()=>setSearchOpen(false)}>Close suggestions</button>
        </div>}
      </form>
      <div className="header-actions"><label className="language-picker"><span className="sr-only">Language</span><select aria-label="Language" value={language} onChange={e=>setLanguage(e.target.value)}><option value="en">EN</option><option value="fr">FR</option><option value="ar">عربي</option></select></label><Link to="/wishlist" className="action-link wishlist-link"><span className="action-icon">♡</span><span><small>Saved</small><b>Wishlist</b></span></Link><Link to="/account" className="action-link"><span className="action-icon">♙</span><span><small>Hello, welcome</small><b>Account</b></span></Link><Link to="/cart" className="action-link cart-link"><span className="cart-icon">🛒<i>{cartCount}</i></span><span><small>Your</small><b>Cart</b></span></Link></div>
    </div>
    <nav id="primary-navigation" className={`nav ${menuOpen ? 'nav-open' : ''}`}><div className="shell nav-inner" onClick={()=>setMenuOpen(false)}><Link to="/categories">☷ <b>Shop by category</b></Link>{categories.slice(1,5).map(c => <Link key={c} to={`/category/${c.toLowerCase()}`}>{c}</Link>)}<Link to="/sellers">Sellers</Link><Link className="nav-deal" to="/search?deal=true">Deals of the day <span>→</span></Link></div></nav>
    </header>
  </>,language)
}

function ProductCard({ product, addToCart, wished, toggleWish, language, compareIds = [], toggleCompare }) {
  const [added,setAdded]=useState(false)
  const [quickViewOpen,setQuickViewOpen]=useState(false)
  const seller=sellerForProduct(product)
  const discount=product.oldPrice?Math.round((1-product.price/product.oldPrice)*100):0
  function quickAdd(){addToCart(product);setAdded(true)}
  useEffect(()=>{
    if(!quickViewOpen)return
    const trigger=document.activeElement
    const previousOverflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    const dialog=document.querySelector(`[aria-labelledby="quick-view-title-${product.id}"]`)
    const focusable=dialog?Array.from(dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')):[]
    focusable[0]?.focus()
    const handleKeys=e=>{
      if(e.key==='Escape'){setQuickViewOpen(false);return}
      if(e.key==='Tab'&&focusable.length){
        const first=focusable[0],last=focusable[focusable.length-1]
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    }
    window.addEventListener('keydown',handleKeys)
    return ()=>{window.removeEventListener('keydown',handleKeys);document.body.style.overflow=previousOverflow;trigger?.focus?.()}
  },[quickViewOpen,product.id])
  return translateTree(<>
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}><img src={product.image} alt={product.name} loading="lazy" /></Link>
        <span className="product-tag">SAMPLE</span>
        {discount>0&&<span className="discount-tag">-{discount}%</span>}
        <button type="button" className={`wish-btn ${wished?'wished':''}`} onClick={()=>toggleWish(product.id)} aria-label={wished?'Remove from wishlist':'Add to wishlist'} aria-pressed={wished}>{wished?'♥':'♡'}</button>
        <button type="button" className="product-quick-view" onClick={()=>setQuickViewOpen(true)} aria-label={`Quick view ${product.name}`}>Quick view <span>↗</span></button>
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <Link to={`/seller/${seller.slug}`} className="seller-name seller-link">⌖ {seller.name} · {seller.city}</Link>
        <div className="price-row"><strong>{money(product.price)}</strong>{product.oldPrice&&<del>{money(product.oldPrice)}</del>}</div>
        {toggleCompare && <button type="button" className={`compare-product-button ${compareIds.includes(product.id) ? 'is-selected' : ''}`} onClick={() => toggleCompare(product.id)} aria-pressed={compareIds.includes(product.id)} disabled={compareIds.length >= 3 && !compareIds.includes(product.id)}>{compareIds.includes(product.id) ? '✓ Added to compare' : compareIds.length >= 3 ? 'Compare limit reached' : '＋ Compare'}</button>}
        <button type="button" className={`add-btn ${added?'added':''}`} onClick={quickAdd} aria-live="polite">{added?'Added to cart ✓':'Add to cart'} <span>{added?'✓':'＋'}</span></button>
      </div>
    </article>
    {quickViewOpen&&<div className="quick-view-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setQuickViewOpen(false)}}>
      <section className="quick-view-dialog" role="dialog" aria-modal="true" aria-labelledby={`quick-view-title-${product.id}`}>
        <button type="button" className="quick-view-close" onClick={()=>setQuickViewOpen(false)} aria-label="Close quick view">×</button>
        <div className="quick-view-image"><img src={product.image} alt={product.name}/></div>
        <div className="quick-view-content">
          <span className="eyebrow">QUICK PRODUCT VIEW · SAMPLE LISTING</span>
          <span className="product-category">{product.category}</span>
          <h2 id={`quick-view-title-${product.id}`}>{product.name}</h2>
          <div className="quick-view-price">{money(product.price)}</div>
          <p>{product.description||'Product specifications and included items should be confirmed directly with the seller.'}</p>
          <div className="quick-view-seller">Sold by <b>{seller.name}</b> · {seller.city}</div>
          <div className="quick-view-actions"><button type="button" className="primary-btn" onClick={quickAdd}>{added?'Added to cart ✓':'Add to demo cart'}</button><Link to={`/product/${product.id}`} className="outline-btn" onClick={()=>setQuickViewOpen(false)}>View full details →</Link></div>
          <small>Illustrative catalogue information. Availability and final terms are not verified.</small>
        </div>
      </section>
    </div>}
  </>,language)
}

function Home({ addToCart, wishlist, toggleWish, language }) {
  const [active,setActive]=useState('All')
  const shown=(active==='All'?products:products.filter(p=>p.category===active)).slice(0,8)
  const populatedCategories=categories.slice(1).filter(name=>products.some(p=>p.category===name))
  const popular=populatedCategories.map((name,i)=>({name,count:products.filter(p=>p.category===name).length,icon:['⌘','◉','✳','⌂','✿','↗','◇','▤','▣','✦','♧','♢','⌁'][i%13],tone:['cat-blue','cat-sand','cat-pink','cat-lilac','cat-green','cat-yellow'][i%6]}))
  const deals=products.filter(p=>p.oldPrice).slice(0,4)
  return translateTree(<main id="main-content" className="shell page home-page">
    <section className="market-hero">
      <div className="market-hero-copy">
        <span className="eyebrow">THE TUNISIAN MARKETPLACE</span>
        <h1>Everything worth finding.<br/><em>Closer to home.</em></h1>
        <p>Search products, compare sample listings and discover independent storefronts from across Tunisia — all in one place.</p>
        <div className="market-hero-actions"><Link to="/search" className="primary-btn">Explore the marketplace <span>→</span></Link><Link to="/categories" className="hero-secondary">Browse categories</Link></div>
        <div className="market-hero-proof"><span>✓ Prices displayed in TND</span><span>✓ Browse by category</span><span>✓ Discover local storefronts</span></div>
      </div>
      <div className="market-hero-art"><img src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1200&q=90" alt="Everyday products arranged for discovery" loading="eager"/><div className="hero-floating-card"><span className="hero-floating-icon">✦</span><div><b>Discover something useful</b><small>Explore the MARCHY sample catalogue</small></div></div><div className="hero-art-caption">LOCAL DISCOVERY <b>·</b> MADE SIMPLE</div></div>
    </section>
    <section className="market-benefits"><div><span>01</span><b>Browse with ease</b><small>Explore products across everyday categories</small></div><div><span>02</span><b>Find local storefronts</b><small>See sample seller profiles and locations</small></div><div><span>03</span><b>Compare in dinars</b><small>All catalogue prices shown in TND</small></div></section>
    <section className="home-quick-discovery" aria-label="Quick category discovery"><div><span className="eyebrow">QUICK DISCOVERY</span><b>What are you shopping for?</b></div><div className="home-quick-links">{populatedCategories.slice(0,7).map(name=><Link key={name} to={`/category/${encodeURIComponent(name.toLowerCase())}`}>{name}<span>↗</span></Link>)}<Link className="quick-all-link" to="/categories">All departments <span>→</span></Link></div></section>
    <section className="section home-category-section">
      <div className="section-heading"><div><span className="eyebrow">START WITH WHAT YOU NEED</span><h2>Explore all categories</h2><p className="muted">A quick route to the things you shop for most.</p></div><Link to="/categories" className="text-link">All categories →</Link></div>
      <div className="home-category-grid">{popular.map(item=><Link key={item.name} to={`/category/${encodeURIComponent(item.name.toLowerCase())}`} className={`home-category-card ${item.tone}`}><span className="home-category-icon">{item.icon}</span><b>{item.name}</b><small>{item.count} sample {item.count===1?'listing':'listings'} <span>→</span></small></Link>)}</div>
    </section>
    <section className="section home-featured-section">
      <div className="section-heading"><div><span className="eyebrow">PICK YOUR NEXT DISCOVERY</span><h2>Popular in the catalogue</h2><p className="muted">A curated look at the current sample listings.</p></div><Link to="/search" className="text-link">Browse all products →</Link></div>
      <div className="home-category-tabs" role="group" aria-label="Filter featured products">{['All','Electronics','Home','Fashion','Beauty','Sports'].map(name=><button key={name} type="button" className={active===name?'active':''} aria-pressed={active===name} onClick={()=>setActive(name)}>{name}</button>)}</div>
      <div className="product-grid">{shown.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language}/>)}</div>
    </section>
    <section className="section home-deals-section"><div className="section-heading"><div><span className="eyebrow">PRICE COMPARISON</span><h2>Listings with sample discounts</h2><p className="muted">Previous prices are illustrative and must be confirmed with the seller.</p></div><Link to="/search?deal=true" className="text-link">See all deals →</Link></div><div className="product-grid">{deals.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language}/>)}</div></section>
    <section className="home-seller-banner"><div><span className="eyebrow">DISCOVER THE PEOPLE BEHIND THE PRODUCTS</span><h2>Find a storefront.<br/><em>Explore what they offer.</em></h2><p>Explore illustrative shop profiles and the products listed in each storefront.</p><Link to="/sellers" className="light-btn">Explore seller directory →</Link></div><div className="seller-banner-stats"><b>{sellers.length}</b><span>sample storefronts</span><b>{populatedCategories.length}</b><span>categories with listings</span></div></section>
    <section className="home-seller-cta"><div><span className="eyebrow">FOR TUNISIAN BUSINESSES</span><h2>Want to sell on MARCHY?</h2><p>Explore the seller information page and follow the product as onboarding tools take shape.</p></div><Link to="/sell" className="outline-btn">Learn about selling →</Link></section>
    <p className="catalogue-note">MARCHY is a frontend prototype. Product listings, storefronts, prices, discounts and availability shown here are illustrative — not verified live offers.</p>
  </main>,language)
}

function SearchPage({ addToCart, wishlist, toggleWish, language }) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const initial = params.get('q') || ''
  const { category: routeCategory } = useParams()
  const initialCategory = categories.find(c => c.toLowerCase() === (routeCategory || '').toLowerCase()) || 'All'
  const isInvalidCategory = Boolean(routeCategory) && initialCategory === 'All'
  const [term, setTerm] = useState(initial)
  const [category, setCategory] = useState(initialCategory)
  const dealsOnly = params.get('deal') === 'true'
  useEffect(() => setTerm(initial), [initial])
  useEffect(() => setCategory(initialCategory), [initialCategory])
  const [sort, setSort] = useState('featured')
  const catalogueMaxPrice = Math.max(100, Math.ceil(Math.max(...products.map(p => p.price)) / 50) * 50)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(catalogueMaxPrice)
  const [city, setCity] = useState('All')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [compareIds, setCompareIds] = useState([])
  const [compareOpen, setCompareOpen] = useState(false)
  const pageSize = 12
  const cities = ['All', ...new Set(products.map(p => sellerForProduct(p).city))].sort((a,b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b))
  const categoryCounts = useMemo(() => products.reduce((counts, p) => ({...counts, [p.category]: (counts[p.category] || 0) + 1}), {}), [])
  const results = useMemo(() => products.filter(p => {
    const seller = sellerForProduct(p)
    const haystack = [p.name, p.category, p.seller, seller.name, seller.city, p.description || ''].join(' ')
    return (category === 'All' || p.category === category) && p.price >= minPrice && p.price <= maxPrice && (city === 'All' || seller.city === city) && (!dealsOnly || Boolean(p.oldPrice)) && searchTextMatches(haystack, term)
  }).sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name) : sort === 'newest' ? b.id - a.id : 0), [term, category, sort, minPrice, maxPrice, dealsOnly, city])
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize))
  const visibleResults = results.slice((page - 1) * pageSize, page * pageSize)
  const activeFilterCount = Number(Boolean(term)) + Number(category !== 'All' && !routeCategory) + Number(city !== 'All') + Number(minPrice > 0) + Number(maxPrice < catalogueMaxPrice) + Number(dealsOnly)
  useEffect(() => setPage(1), [term, category, sort, minPrice, maxPrice, dealsOnly, city])
  const updateTerm = value => {
    setTerm(value)
    const next = new URLSearchParams(params)
    if (value.trim()) next.set('q', value)
    else next.delete('q')
    setParams(next, { replace: true })
  }
  const clearFilters = () => {
    setCategory(routeCategory ? initialCategory : 'All')
    setMinPrice(0)
    setMaxPrice(catalogueMaxPrice)
    setTerm('')
    setCity('All')
    setPage(1)
    setParams({}, { replace: true })
  }
  const removeDealFilter = () => {
    const next = new URLSearchParams(params)
    next.delete('deal')
    setParams(next, { replace: true })
  }
  const toggleCompare = id => setCompareIds(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current)
  const comparedProducts = compareIds.map(id => products.find(product => product.id === id)).filter(Boolean)
  const removeCategoryFilter = () => {
    if (routeCategory) navigate('/search')
    else setCategory('All')
  }
  if (isInvalidCategory) return translateTree(<main id="main-content" className='shell page'><div className='breadcrumbs'><Link to='/'>Home</Link> / <Link to='/categories'>Categories</Link></div><div className='empty-state'><span>⌕</span><h2>Category not found</h2><p>This category does not exist in the MARCHY catalogue.</p><Link to='/categories' className='primary-btn'>Browse all categories →</Link></div></main>, language)
  return translateTree(<main id="main-content" className="shell page">
    <div className="breadcrumbs"><Link to="/">Home</Link> / Marketplace</div>
    <div className="listing-head">
      <div><span className="eyebrow">{routeCategory ? "EXPLORE THIS CATEGORY" : "SHOP THE MARCHY MARKETPLACE"}</span><h1>{routeCategory ? category : "Find what you’re looking for."}</h1><p className="muted">{routeCategory ? "Browse products in this category." : results.length + " products to explore"}</p></div>
      <div className="listing-search"><input aria-label="Search marketplace" value={term} onChange={e => updateTerm(e.target.value)} placeholder="What are you looking for?"/><span>⌕</span></div>
    </div>
    <div className="mobile-filter-toggle"><button type="button" className="outline-btn" onClick={() => setFiltersOpen(v => !v)} aria-expanded={filtersOpen} aria-controls="marketplace-filters">☷ Filters {activeFilterCount > 0 ? '· ' + activeFilterCount + ' active' : ''}</button><span>{results.length} results</span></div>
    {activeFilterCount > 0 && <div className="active-filter-chips" aria-label="Active filters">
      {term && <button type="button" onClick={() => updateTerm('')}>Search: {term} <span>×</span></button>}
      {category !== 'All' && !routeCategory && <button type="button" onClick={removeCategoryFilter}>{category} <span>×</span></button>}
      {city !== 'All' && <button type="button" onClick={() => setCity('All')}>{city} <span>×</span></button>}
      {minPrice > 0 && <button type="button" onClick={() => setMinPrice(0)}>From {minPrice} TND <span>×</span></button>}
      {maxPrice < catalogueMaxPrice && <button type="button" onClick={() => setMaxPrice(catalogueMaxPrice)}>Up to {maxPrice} TND <span>×</span></button>}
      {dealsOnly && <button type="button" onClick={removeDealFilter}>Deals only <span>×</span></button>}
      <button type="button" className="clear-filter-chips" onClick={clearFilters}>Clear all</button>
    </div>}
    {routeCategory && <div className="category-context-strip"><span className="category-context-icon">✦</span><div><b>{category}</b><small>Browse sample listings, compare displayed prices and visit demo storefronts.</small></div><Link to="/categories">All categories →</Link></div>}
    <div className="listing-layout">
      <aside id="marketplace-filters" className={'filters ' + (filtersOpen ? 'filters-open' : '')} aria-label="Marketplace filters">
        <h3>Filters <button type="button" onClick={clearFilters}>Clear all</button></h3>
        <div className="filter-group"><b>Category</b>{categories.map(c => <label key={c}><input type="radio" name="marketplace-category" checked={category === c} onChange={() => routeCategory ? navigate(c === "All" ? "/search" : "/category/" + encodeURIComponent(c.toLowerCase())) : setCategory(c)}/><span>{c === 'All' ? 'All categories' : c}</span><small>{c === 'All' ? products.length : (categoryCounts[c] || 0)}</small></label>)}</div>
        <div className="filter-group"><b>Seller location</b><select aria-label="Seller location" value={city} onChange={e => setCity(e.target.value)}>{cities.map(c => <option key={c} value={c}>{c === 'All' ? 'All locations' : c}</option>)}</select></div>
        <div className="filter-group price-filter-group"><b>Price range</b><div className="price-inputs"><label>Min <input aria-label="Minimum price in TND" type="number" min="0" max={catalogueMaxPrice} value={minPrice} onChange={e => setMinPrice(Math.min(catalogueMaxPrice, Math.max(0, Number(e.target.value) || 0)))}/></label><label>Max <input aria-label="Maximum price in TND" type="number" min="0" max={catalogueMaxPrice} value={maxPrice} onChange={e => setMaxPrice(Math.max(minPrice, Math.min(catalogueMaxPrice, Number(e.target.value) || 0)))}/></label></div><input aria-label="Maximum price" type="range" min="0" max={catalogueMaxPrice} step="5" value={maxPrice} onChange={e => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}/><div className="price-range-labels"><span>0 TND</span><span>{catalogueMaxPrice} TND</span></div></div>
        {dealsOnly && <div className="filter-note">Showing sample listings with illustrative previous prices. Discount claims are not verified offers.</div>}
        <button className="filter-apply" type="button" onClick={() => setFiltersOpen(false)}>Show {results.length} products</button>
      </aside>
      <section className="listing-results" aria-live="polite">
        <div className="results-toolbar"><span>Showing <b>{results.length ? ((page - 1) * pageSize) + 1 : 0}–{Math.min(page * pageSize, results.length)}</b> of <b>{results.length}</b></span><label>Sort by <select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option><option value="newest">Recently added</option></select></label></div>
        {compareIds.length > 0 && <section className="compare-tray" aria-label="Product comparison">
          <div className="compare-tray-heading"><div><b>Compare sample listings</b><span>{compareIds.length} of 3 selected · prices and seller details are illustrative</span></div><div><button type="button" className="compare-clear" onClick={() => {setCompareIds([]);setCompareOpen(false)}}>Clear</button><button type="button" className="compare-show" disabled={compareIds.length < 2} onClick={() => setCompareOpen(v => !v)}>{compareOpen ? 'Hide comparison' : 'Compare now'}</button></div></div>
          {compareIds.length < 2 && <p className="compare-hint">Select at least one more product to compare.</p>}
          {compareOpen && <div className="compare-table-wrap"><table className="compare-table"><thead><tr><th scope="col">Listing</th>{comparedProducts.map(product => <th scope="col" key={product.id}><Link to={'/product/' + product.id}>{product.name}</Link><button type="button" onClick={() => toggleCompare(product.id)} aria-label={'Remove ' + product.name + ' from comparison'}>×</button></th>)}</tr></thead><tbody>
            <tr><th scope="row">Displayed price</th>{comparedProducts.map(product => <td key={product.id}>{money(product.price)}</td>)}</tr>
            <tr><th scope="row">Category</th>{comparedProducts.map(product => <td key={product.id}>{product.category}</td>)}</tr>
            <tr><th scope="row">Seller</th>{comparedProducts.map(product => <td key={product.id}>{sellerForProduct(product).name}</td>)}</tr>
            <tr><th scope="row">Seller location</th>{comparedProducts.map(product => <td key={product.id}>{sellerForProduct(product).city}</td>)}</tr>
            <tr><th scope="row">Listing status</th>{comparedProducts.map(product => <td key={product.id}>Sample listing · availability unconfirmed</td>)}</tr>
          </tbody></table><p className="compare-disclaimer">This comparison uses only information in MARCHY’s illustrative catalogue. It does not compare technical specifications, product condition, verified stock or delivery terms.</p></div>}
        </section>}
        {results.length ? <><div className="product-grid">{visibleResults.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language} compareIds={compareIds} toggleCompare={toggleCompare}/>)}</div>{pageCount > 1 && <nav className="pagination" aria-label="Product pages"><button type="button" disabled={page === 1} onClick={() => setPage(v => Math.max(1, v - 1))}>← Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage(v => Math.min(pageCount, v + 1))}>Next →</button></nav>}</> : <div className="empty-state"><span>⌕</span><h3>No products found</h3><p>Try a broader search, choose another category or reset your price and location filters.</p><button type="button" className="outline-btn" onClick={clearFilters}>Reset all filters</button></div>}
      </section>
    </div>
  </main>, language)
}

function ProductPage({ addToCart, wishlist, toggleWish, language }) {
  const { id } = useParams()
  const product = products.find(p => p.id === Number(id))
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  if (!product) return translateTree(<main id="main-content" className="shell page empty-state"><span>⌕</span><h2>Product not found</h2><p>This listing may have moved or is no longer available in the sample catalogue.</p><Link to="/search" className="primary-btn">Back to marketplace →</Link></main>, language)
  const seller = sellerForProduct(product)
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
  const saved = wishlist.includes(product.id)
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0
  const handleAdd = () => { addToCart(product, qty); setAdded(true) }
  return translateTree(<main id="main-content" className="shell page product-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/search">Marketplace</Link><span>/</span><Link to={`/category/${encodeURIComponent(product.category.toLowerCase())}`}>{product.category}</Link><span>/</span><span aria-current="page">{product.name}</span></nav>
    <div className="product-detail-layout">
      <section className="product-visual-column" aria-label="Product images">
        <div className="product-image-stage">
          <img src={product.image} alt={product.name} fetchPriority="high" />
          <span className="product-image-label">MARCHY SAMPLE</span>
          {discount > 0 && <span className="product-image-discount">-{discount}%</span>}
        </div>
        <div className="product-image-caption"><span>01 / 01</span><span>Product image for this illustrative listing</span></div>
        <div className="product-visual-note"><span>ⓘ</span><p>Images and listing information are provided as demonstration content. Confirm the exact item with the seller before ordering.</p></div>
      </section>
      <section className="product-buy-panel">
        <div className="product-buy-topline"><Link to={`/category/${encodeURIComponent(product.category.toLowerCase())}`} className="product-category-pill">{product.category}</Link><span className="sample-status">Sample listing</span></div>
        <h1>{product.name}</h1>
        <div className="product-price-block"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}{discount > 0 && <span>{discount}% illustrative difference</span>}</div>
        <p className="product-price-caption">Displayed in Tunisian dinars (TND). Final price and availability must be confirmed with the seller.</p>
        <div className="product-listing-status"><span className="status-dot"></span><div><b>Availability to be confirmed</b><small>This is not live stock information.</small></div></div>
        <div className="product-purchase-controls">
          <label htmlFor="product-quantity">Quantity</label>
          <div className="product-purchase-row">
            <div className="quantity product-quantity">
              <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(v => Math.max(1, v - 1))}>−</button>
              <output id="product-quantity" aria-live="polite">{qty}</output>
              <button type="button" aria-label="Increase quantity" disabled={qty >= 99} onClick={() => setQty(v => Math.min(99, v + 1))}>＋</button>
            </div>
            <button type="button" className="primary-btn product-add-button" onClick={handleAdd}>{added ? 'Added to cart ✓' : 'Add to cart'}</button>
            <button type="button" className={`product-save-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove from saved items' : 'Save for later'} aria-pressed={saved} onClick={() => toggleWish(product.id)}>{saved ? '♥' : '♡'}</button>
          </div>
          {added && <p className="product-added-feedback" role="status">Added to your demo cart. You can review it whenever you're ready.</p>}
        </div>
        <div className="product-seller-card">
          <span className="seller-avatar">{seller.name.slice(0, 1)}</span>
          <div className="product-seller-copy"><small>Seller storefront</small><b>{seller.name}</b><span>{seller.city}, Tunisia · Demo profile</span></div>
          <Link to={`/seller/${seller.slug}`}>View seller <span>→</span></Link>
        </div>
        <div className="product-delivery-card"><span className="delivery-symbol">⌖</span><div><b>Delivery details confirmed by seller</b><p>Ask the seller about delivery coverage, cost and estimated timing before placing an order.</p></div></div>
        <p className="product-demo-disclaimer">Frontend demonstration only. No order, payment or delivery booking is submitted.</p>
      </section>
    </div>
    <section className="product-information-grid">
      <article className="product-information-card">
        <span className="eyebrow">PRODUCT DETAILS</span><h2>About this listing</h2>
        <p>{product.description || 'No product information has been supplied for this sample listing. Contact the seller to confirm the exact product, condition, specifications and what is included.'}</p>
        <dl className="product-attribute-list"><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Seller location</dt><dd>{seller.city}, Tunisia</dd></div><div><dt>Price display</dt><dd>Tunisian dinar (TND)</dd></div><div><dt>Listing type</dt><dd>Sample catalogue</dd></div></dl>
      </article>
      <article className="product-information-card product-order-checklist">
        <span className="eyebrow">BEFORE YOU ORDER</span><h2>Confirm these details with the seller</h2>
        <ul><li>Product condition and included items</li><li>Current availability and final price</li><li>Delivery cost, coverage and timing</li><li>Returns, exchanges and warranty terms</li></ul>
        <Link to={`/seller/${seller.slug}`} className="text-link">Visit {seller.name}'s storefront →</Link>
      </article>
    </section>
    {related.length > 0 && <section className="section related-products"><div className="section-heading"><div><span className="eyebrow">KEEP EXPLORING</span><h2>More from {product.category}</h2></div><Link to={`/category/${encodeURIComponent(product.category.toLowerCase())}`} className="text-link">Browse category →</Link></div><div className="product-grid">{related.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language}/>)}</div></section>}
    <div className="product-mobile-buybar"><div><small>Price</small><b>{money(product.price)}</b></div><button type="button" className="primary-btn" onClick={handleAdd}>{added ? 'Added ✓' : 'Add to cart'}</button></div>
  </main>, language)
}

function CartPage({ cart, updateQty, removeItem, language }) {
  const [checkoutInfo, setCheckoutInfo] = useState(false)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const sellerCount = new Set(cart.map(item => sellerForProduct(item).slug)).size
  return translateTree(<main id="main-content" className="shell page cart-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span aria-current="page">Your cart</span></div>
    <div className="cart-page-heading">
      <div><span className="eyebrow">YOUR MARCHY BASKET</span><h1>Your shopping cart</h1><p>{itemCount} items · {cart.length} products · {sellerCount} sellers</p></div>
      <Link to="/search" className="cart-continue-link">← Continue shopping</Link>
    </div>
    {cart.length ? <div className="cart-layout">
      <section className="cart-items-panel" aria-label="Cart items">
        <div className="cart-panel-heading"><b>Items in your cart</b><span>{cart.length} product{cart.length === 1 ? '' : 's'}</span></div>
        {cart.map(item => {
          const seller = sellerForProduct(item)
          return <article className="cart-item" key={item.id}>
            <Link to={`/product/${item.id}`} className="cart-item-photo"><img src={item.image} alt={item.name} loading="lazy"/></Link>
            <div className="cart-item-info">
              <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
              <small>{seller.name} · {seller.city}, Tunisia</small>
              <b className="cart-item-unit-price">{money(item.price)} <span>each</span></b>
              <button type="button" className="remove-link" onClick={() => removeItem(item.id)}>Remove item</button>
            </div>
            <div className="cart-item-quantity"><span>Quantity</span><div className="quantity">
              <button type="button" aria-label={`Decrease ${item.name} quantity`} disabled={item.qty <= 1} onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
              <output aria-live="polite">{item.qty}</output>
              <button type="button" aria-label={`Increase ${item.name} quantity`} disabled={item.qty >= 99} onClick={() => updateQty(item.id, Math.min(99, item.qty + 1))}>＋</button>
            </div></div>
            <strong className="cart-line-total">{money(item.price * item.qty)}</strong>
          </article>
        })}
        <div className="cart-panel-footer"><span>Need something else?</span><Link to="/categories">Explore all categories →</Link></div>
      </section>
      <aside className="summary-card cart-summary">
        <div className="cart-summary-title"><div><span className="eyebrow">YOUR ORDER</span><h2>Order summary</h2></div><span className="cart-summary-count">{itemCount} items</span></div>
        <div className="cart-summary-row"><span>Products subtotal</span><b>{money(subtotal)}</b></div>
        <div className="cart-summary-row"><span>Delivery</span><b className="summary-pending">To be confirmed</b></div>
        <div className="cart-summary-row"><span>Discounts</span><b>—</b></div>
        <div className="summary-total"><span>Estimated product total</span><strong>{money(subtotal)}</strong></div>
        <p className="cart-summary-note">Delivery charges, availability and final prices are not yet connected to live seller systems. They are not included in this estimate.</p>
        <button type="button" className="primary-btn full-btn cart-checkout-button" onClick={() => setCheckoutInfo(v => !v)} aria-expanded={checkoutInfo}>Review checkout <span>→</span></button>
        {checkoutInfo && <div className="checkout-demo" role="status"><b>Checkout preview</b><p>This is a frontend demonstration. No order is submitted and no personal or payment information is collected. In a live marketplace, the next step would confirm each seller's stock, delivery and final payable amount.</p><button type="button" className="outline-btn" onClick={() => setCheckoutInfo(false)}>Close preview</button></div>}
        <div className="cart-trust-note"><span>ⓘ</span><p>You're reviewing a sample basket. No payment is taken and no order is placed.</p></div>
      </aside>
    </div> : <div className="cart-empty-state"><div className="cart-empty-icon">🛒</div><span className="eyebrow">A FRESH START</span><h2>Your cart is empty</h2><p>Explore the marketplace and add products you'd like to come back to.</p><div><Link to="/search" className="primary-btn">Explore products →</Link><Link to="/categories" className="cart-empty-secondary">Browse categories</Link></div></div>}
  </main>, language)
}

function WishlistPage({ products: allProducts, wishlist, toggleWish, addToCart, language }) {
  const saved = allProducts.filter(product => wishlist.includes(product.id))
  const savedCategories = [...new Set(saved.map(product => product.category))]
  return translateTree(<main id="main-content" className="shell page wishlist-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span aria-current="page">Saved items</span></div>
    <div className="wishlist-heading">
      <div><span className="eyebrow">YOUR PERSONAL COLLECTION</span><h1>Saved items</h1><p>Keep the products you're considering in one place.</p></div>
      <div className="wishlist-count"><strong>{saved.length}</strong><span>saved products</span></div>
    </div>
    {saved.length ? <>
      <div className="wishlist-toolbar"><div><b>Your shortlist</b><span>{savedCategories.length} categories</span></div><Link to="/search">Discover more products →</Link></div>
      <div className="product-grid wishlist-product-grid">{saved.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} wished={true} toggleWish={toggleWish} language={language}/>)}</div>
      <div className="wishlist-footnote"><span>♡</span><p>Your saved list stays on this device in this demo. It is not synced between devices or accounts.</p></div>
    </> : <div className="wishlist-empty">
      <div className="wishlist-empty-icon">♡</div><span className="eyebrow">YOUR NEXT FIND IS OUT THERE</span><h2>No saved products yet</h2><p>Tap the heart on any product to save it here while you compare your options.</p><Link to="/search" className="primary-btn">Explore the marketplace →</Link>
    </div>}
  </main>,language)
}

function SellersPage({language}) {
 const [term,setTerm]=useState('')
 const [city,setCity]=useState('All')
 const [category,setCategory]=useState('All')
 const cities=['All',...new Set(sellers.map(s=>s.city))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b))
 const sellerCategories=['All',...new Set(sellers.flatMap(s=>s.categories))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b))
 const visible=sellers.filter(s=>(city==='All'||s.city===city)&&(category==='All'||s.categories.includes(category))&&(!term.trim()||[s.name,s.city,s.tagline,...s.categories].join(' ').toLowerCase().includes(term.trim().toLowerCase())))
 return translateTree(<main id="main-content" className="shell page seller-directory-page"><div className="breadcrumbs"><Link to="/">Home</Link> / Sellers</div><section className="seller-directory-hero"><span className="eyebrow">DISCOVER LOCAL BUSINESSES</span><h1>Meet the sellers behind the finds.</h1><p>Explore sample storefronts from across Tunisia. Profiles and listings are demonstration content, not verified businesses.</p><div className="seller-directory-stats"><span><b>{sellers.length}</b><small>Sample storefronts</small></span><span><b>{new Set(sellers.map(s=>s.city)).size}</b><small>Locations represented</small></span><span><b>{products.length}</b><small>Sample listings</small></span></div></section>
 <section className="seller-directory-tools" aria-label="Find a seller"><label className="seller-directory-search"><span>⌕</span><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search shops, products or locations" aria-label="Search sellers"/></label><label>City<select value={city} onChange={e=>setCity(e.target.value)}>{cities.map(x=><option key={x}>{x}</option>)}</select></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{sellerCategories.map(x=><option key={x}>{x}</option>)}</select></label><button type="button" className="seller-directory-reset" onClick={()=>{setTerm('');setCity('All');setCategory('All')}}>Reset</button></section>
 <div className="seller-directory-results"><b>{visible.length} storefront{visible.length===1?'':'s'}</b><span>Sample profiles · not independently verified</span></div>
 {visible.length?<div className="seller-directory-grid">{visible.map(s=><article className="seller-directory-card" key={s.slug}><div className="seller-card-top"><span className="seller-avatar large">{s.name.slice(0,1)}</span><span className="demo-label">DEMO STOREFRONT</span></div><h2>{s.name}</h2><p className="seller-location">⌖ {s.city}, Tunisia</p><p>{s.tagline}</p><div className="seller-category-tags">{s.categories.map(c=><span key={c}>{c}</span>)}</div><Link to={`/seller/${s.slug}`} className="seller-visit-link">View storefront <span>→</span></Link></article>)}</div>:<div className="empty-state seller-directory-empty"><span>⌕</span><h2>No matching storefronts</h2><p>Try another shop name, city or category.</p><button type="button" className="outline-btn" onClick={()=>{setTerm('');setCity('All');setCategory('All')}}>Clear seller filters</button></div>}
 </main>,language)
}

function SellerPage({language,addToCart,wishlist,toggleWish}) {
 const {slug}=useParams(); const seller=sellers.find(s=>s.slug===slug)
 const [search,setSearch]=useState(''); const [category,setCategory]=useState('All'); const [sort,setSort]=useState('featured')
 if(!seller)return <main id="main-content" className="shell page empty-state"><h2>Storefront not found</h2><Link to="/sellers" className="text-link">Browse sellers →</Link></main>
 const items=products.filter(p=>sellerForProduct(p).slug===seller.slug)
 const storeCategories=['All',...new Set(items.map(p=>p.category))]
 const visibleItems=items.filter(p=>(category==='All'||p.category===category)&&searchTextMatches([p.name,p.category,p.description||''].join(' '),search)).sort((a,b)=>sort==='low'?a.price-b.price:sort==='high'?b.price-a.price:sort==='name'?a.name.localeCompare(b.name):0)
 return translateTree(<main id="main-content" className="shell page seller-store-page"><div className="breadcrumbs"><Link to="/">Home</Link> / <Link to="/sellers">Sellers</Link> / {seller.name}</div><section className="seller-store-hero"><div className="seller-store-cover"><span className="seller-cover-wordmark">{seller.name.split(' ').map(x=>x[0]).join('')}</span><span className="seller-cover-caption">LOCAL FINDS · MARCHY STOREFRONT</span></div><div className="seller-store-identity"><span className="seller-avatar store-avatar">{seller.name.slice(0,1)}</span><div><span className="demo-label">DEMO STOREFRONT · NOT VERIFIED</span><h1>{seller.name}</h1><p>⌖ {seller.city}, Tunisia</p></div></div><p className="seller-store-tagline">{seller.tagline}</p><p className="muted">{seller.description}</p><div className="seller-category-tags">{seller.categories.map(c=><Link key={c} to={`/category/${encodeURIComponent(c.toLowerCase())}`}>{c}</Link>)}</div><div className="seller-store-meta"><span><b>{items.length}</b> sample listings</span><span>Seller information requires confirmation</span></div></section><div className="section-heading seller-products-heading"><div><span className="eyebrow">SHOP THIS STOREFRONT</span><h2>Products from {seller.name}</h2><p className="muted">{visibleItems.length} of {items.length} illustrative listings</p></div><Link to="/sellers" className="text-link">All sellers →</Link></div><div className="store-product-tools"><div className="store-category-filters" role="group" aria-label="Filter storefront products">{storeCategories.map(c=><button type="button" key={c} className={category===c?'active':''} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="store-search-sort"><label className="store-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search this storefront…" aria-label="Search this storefront"/></label><label className="store-sort-label"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort storefront products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name: A to Z</option></select></label></div></div>{visibleItems.length?<div className="product-grid">{visibleItems.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language}/>)}</div>:<div className="empty-state store-no-results"><h3>No matching products</h3><p>Try another search or select a different category.</p><button type="button" className="outline-btn" onClick={()=>{setSearch('');setCategory('All')}}>Clear storefront filters</button></div>}<p className="storefront-demo-note">This is a demonstration storefront. Seller identity, product details, availability, prices and delivery terms have not been independently verified.</p></main>,language)
}

function CategoriesPage({language}) {
 const icons=['⌘','◉','✳','⌂','✿','↗','◇','▤','▣','✦','♧','♢','⌁']
 const tones=['cat-blue','cat-sand','cat-pink','cat-lilac','cat-green','cat-yellow']
 return translateTree(<main id="main-content" className="shell page categories-page"><div className="breadcrumbs"><Link to="/">Home</Link> / Categories</div><section className="categories-intro"><span className="eyebrow">EXPLORE MARCHY</span><h1>Find your category.</h1><p>Browse the catalogue by what you need. Every category opens a dedicated product results view.</p><div className="category-total"><b>{categories.length-1}</b><span>everyday categories</span></div></section><div className="category-directory-grid">{categories.slice(1).map((name,i)=>{const count=products.filter(p=>p.category===name).length;return <Link to={`/category/${encodeURIComponent(name.toLowerCase())}`} className="category-directory-card" key={name}><span className={`category-directory-icon ${tones[i%tones.length]}`}>{icons[i%icons.length]}</span><span className="category-directory-copy"><b>{name}</b><small>{count} sample {count===1?'listing':'listings'}</small></span><span className="category-directory-arrow">→</span></Link>})}</div><div className="categories-bottom-cta"><div><b>Not sure where to start?</b><span>Browse the full sample catalogue and use filters to narrow your search.</span></div><Link to="/search" className="primary-btn">Explore all products →</Link></div></main>,language)
}

function SellerLaunchPage({language}) {
  const [storeName,setStoreName]=useState('')
  const [city,setCity]=useState('Tunis')
  const [category,setCategory]=useState('Electronics')
  const [description,setDescription]=useState('')
  const [contact,setContact]=useState('')
  const [productName,setProductName]=useState('')
  const [productPrice,setProductPrice]=useState('')
  const [productCategory,setProductCategory]=useState('Electronics')
  const [productDescription,setProductDescription]=useState('')
  const [productCondition,setProductCondition]=useState('New')
  const [productStock,setProductStock]=useState('1')
  const [productReferencePrice,setProductReferencePrice]=useState('')
  const [productVariants,setProductVariants]=useState('')
  const [productImage,setProductImage]=useState('')
  const [productImageName,setProductImageName]=useState('')
  const [previewOpen,setPreviewOpen]=useState(false)
  const steps=[{number:'01',title:'Prepare your business details',copy:'Choose a storefront name, location and main category.'},{number:'02',title:'Plan your first listings',copy:'Prepare clear product names, accurate prices and original photos.'},{number:'03',title:'Review before launch',copy:'Confirm fulfilment, returns and customer contact arrangements.'}]
  return translateTree(<main id="main-content" className="shell page seller-launch-page">
    <div className="breadcrumbs"><Link to="/">Home</Link> / <span>Sell on MARCHY</span></div>
    <section className="seller-launch-hero">
      <div className="seller-launch-copy"><span className="eyebrow">MARCHY FOR BUSINESSES · TUNISIA</span><h1>Make your storefront the next local discovery.</h1><p>Prepare a clear shop profile and product listing plan. This preview helps you organise the information you will need before seller onboarding opens.</p><div className="seller-launch-actions"><a href="#seller-workspace" className="primary-btn">Build your storefront preview <span>→</span></a><Link to="/seller-help" className="seller-launch-secondary">Seller preparation guide</Link><Link to="/seller-dashboard" className="seller-launch-secondary">Seller dashboard preview ↗</Link></div><div className="seller-launch-trust"><span>✓ Free to prepare</span><span>✓ No account required</span><span>✓ Nothing is submitted</span></div></div>
      <div className="seller-launch-art"><div className="seller-art-window"><div className="seller-art-top"><i></i><i></i><i></i><span>YOUR STOREFRONT</span></div><div className="seller-art-brand">YOUR SHOP<span>.</span></div><div className="seller-art-lines"><b></b><b></b><b></b></div><div className="seller-art-products"><span>✳</span><span>◇</span><span>⌂</span></div><small>AN IDEA, READY TO TAKE SHAPE</small></div></div>
    </section>
    <section className="seller-launch-steps"><div className="seller-section-heading"><span className="eyebrow">A SIMPLE START</span><h2>What you should prepare</h2><p>Three practical steps to get your business ready for a marketplace storefront.</p></div><div className="seller-step-grid">{steps.map(step=><article className="seller-step-card" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}</div></section>
    <section className="seller-workspace" id="seller-workspace"><div className="seller-workspace-heading"><div><span className="eyebrow">STOREFRONT PLANNER</span><h2>Build your shop preview</h2><p>Enter sample details to see how your storefront could be presented.</p></div><span className="seller-draft-label">LOCAL PREVIEW ONLY</span></div>
      <div className="seller-planner-grid"><form className="seller-planner-form" onSubmit={e=>{e.preventDefault();setPreviewOpen(true)}}><h3>01 · Business profile</h3><label>Storefront name<input value={storeName} onChange={e=>setStoreName(e.target.value)} placeholder="e.g. Medina Home Studio" maxLength={60}/></label><div className="seller-form-row"><label>City<select value={city} onChange={e=>setCity(e.target.value)}>{['Tunis','Ariana','Ben Arous','Manouba','Sfax','Sousse','Monastir','Nabeul','Bizerte','Gabès','Other'].map(x=><option key={x}>{x}</option>)}</select></label><label>Main category<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label></div><label>Short business description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What do you sell, and what should customers know about your shop?" rows={3} maxLength={240}/><small>{description.length}/240 characters</small></label><label>Business contact email <span className="seller-optional">optional · preview only</span><input type="email" value={contact} onChange={e=>setContact(e.target.value)} placeholder="hello@example.tn"/></label><div className="seller-form-divider"></div><h3>02 · First product listing</h3><label>Product name<input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="e.g. Handmade ceramic serving bowl" maxLength={90}/></label><div className="seller-form-row"><label>Displayed price (TND)<input type="number" min="0" step="0.01" value={productPrice} onChange={e=>setProductPrice(e.target.value)} placeholder="0.00" required/></label><label>Product category<select value={productCategory} onChange={e=>setProductCategory(e.target.value)}>{categories.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label></div>
      <div className="seller-form-row"><label>Reference price (TND) <span className="seller-optional">optional</span><input type="number" min="0" step="0.01" value={productReferencePrice} onChange={e=>setProductReferencePrice(e.target.value)} placeholder="Only if genuine"/></label><label>Condition<select value={productCondition} onChange={e=>setProductCondition(e.target.value)}><option>New</option><option>Used</option><option>Refurbished</option><option>Handmade</option></select></label></div>
      <label>Product description<textarea value={productDescription} onChange={e=>setProductDescription(e.target.value)} placeholder="Describe materials, dimensions, features and what is included." rows={4} maxLength={700}/><small>{productDescription.length}/700 characters</small></label>
      <div className="seller-form-row"><label>Stock quantity<input type="number" min="0" step="1" value={productStock} onChange={e=>setProductStock(e.target.value)}/></label><label>Variants <span className="seller-optional">optional · comma separated</span><input value={productVariants} onChange={e=>setProductVariants(e.target.value)} placeholder="e.g. Black, White, 128 GB"/></label></div>
      <label className="seller-image-upload">Product image <span className="seller-optional">optional · preview only</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files&&e.target.files[0];if(!file)return;if(file.size>5*1024*1024){setProductImage('');setProductImageName('Image must be 5 MB or smaller');return;}const reader=new FileReader();reader.onload=()=>{setProductImage(typeof reader.result==='string'?reader.result:'');setProductImageName(file.name)};reader.readAsDataURL(file)}}/><small>{productImageName||'JPG, PNG or WebP · maximum 5 MB. Image stays in this browser preview.'}</small></label>
      <button className="seller-preview-button" type="submit">Update product and storefront preview <span>→</span></button><p className="seller-form-note">Your entries stay in this page's temporary state. They are not saved, sent or submitted to MARCHY.</p></form>
      <aside className="seller-live-preview" aria-live="polite"><div className="seller-preview-top"><span>STOREFRONT PREVIEW</span><span className="seller-preview-dot">● DEMO</span></div><div className="seller-preview-cover"><span>✳</span></div><div className="seller-preview-body"><div className="seller-preview-avatar">{storeName.trim()?storeName.trim().slice(0,1).toUpperCase():'S'}</div><h3>{storeName.trim()||'Your Storefront Name'}</h3><p className="seller-preview-location">⌖ {city}, Tunisia · {category}</p><p>{description.trim()||'Your short business description will appear here, helping customers understand what your shop offers.'}</p><div className="seller-preview-meta"><span>NEW STOREFRONT</span><span>DETAILS NOT VERIFIED</span></div><div className="seller-preview-product"><div className="seller-preview-product-image">{productImage?<img src={productImage} alt="Your uploaded product preview"/>:'◇'}</div><div><b>{productName.trim()||'Your first product listing'}</b><small>{productCategory} · {productCondition}</small><strong>{productPrice && Number(productPrice)>0 ? Number(productPrice).toLocaleString('en-TN',{maximumFractionDigits:2})+' TND' : 'Price to be added'}</strong>{productReferencePrice&&Number(productReferencePrice)>Number(productPrice)&&<del>{Number(productReferencePrice).toLocaleString('en-TN')} TND</del>}</div></div><div className="seller-preview-contact">{contact.trim()||'Business contact details not added'}</div><div className="seller-product-preview-details">{productDescription.trim()||'Product description will appear here.'}<span>Quantity entered: {productStock} · {productVariants.trim()?'Options: '+productVariants:'No variants entered'}</span></div></div></aside></div>
      {previewOpen&&<div className="seller-preview-confirmation" role="status"><b>Your storefront preview is updated.</b><span>This is a planning draft only. No seller application or product listing has been submitted.</span></div>}
    </section>
    <section className="seller-launch-bottom"><div><span className="eyebrow">BEFORE YOU START SELLING</span><h2>Good listings begin with clear information.</h2><p>Prepare accurate descriptions, original product images, clear pricing, stock information and realistic delivery and return terms. Do not advertise claims you cannot support.</p></div><Link to="/seller-help" className="outline-btn">Read seller preparation guide →</Link></section>
    <p className="catalogue-note">Seller onboarding is not open through this prototype. This planner does not create an account, verify a business, publish products or accept applications.</p>
  </main>,language)
}

function SellerDashboardPage({language}) {
 const [sellerSlug,setSellerSlug]=useState(sellers[0].slug)
 const [tab,setTab]=useState('overview')
 const [query,setQuery]=useState('')
 const [category,setCategory]=useState('All')
 const seller=sellers.find(s=>s.slug===sellerSlug)||sellers[0]
 const sellerProducts=products.filter(p=>sellerForProduct(p).slug===seller.slug)
 const categoriesForSeller=['All',...new Set(sellerProducts.map(p=>p.category))]
 const visible=sellerProducts.filter(p=>(category==='All'||p.category===category)&&searchTextMatches([p.name,p.category,p.description||''].join(' '),query))
 const tabs=[['overview','Overview','⌂'],['products','Products','▦'],['storefront','Storefront','▤'],['insights','Insights','↗'],['settings','Settings','⚙']]
 return translateTree(<main id="main-content" className="shell page seller-dashboard-page">
  <div className="breadcrumbs"><Link to="/">Home</Link> / <Link to="/sell">Sell on MARCHY</Link> / <span>Seller workspace</span></div>
  <section className="seller-dashboard-heading"><div><span className="eyebrow">MARCHY SELLER CENTRE</span><h1>Your seller workspace.</h1><p>Explore how a seller dashboard could organise products, storefront details and insights.</p></div><span className="seller-dashboard-demo">DEMO WORKSPACE · SAMPLE DATA</span></section>
  <div className="seller-dashboard-shell">
   <aside className="seller-dashboard-sidebar"><div className="seller-dashboard-shop"><span className="seller-avatar">{seller.name.slice(0,1)}</span><div><b>{seller.name}</b><small>{seller.city}, Tunisia</small></div></div><label className="seller-dashboard-select">Preview storefront<select value={sellerSlug} onChange={e=>setSellerSlug(e.target.value)}>{sellers.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label><nav aria-label="Seller dashboard sections">{tabs.map(([id,label,icon])=><button type="button" key={id} className={tab===id?'active':''} onClick={()=>setTab(id)} aria-current={tab===id?'page':undefined}><span>{icon}</span>{label}{tab===id&&<i>›</i>}</button>)}</nav><div className="seller-dashboard-sidebar-note"><b>Prototype workspace</b><span>Changes here do not update a real seller account or catalogue.</span></div></aside>
   <section className="seller-dashboard-main">
    <div className="seller-dashboard-main-heading"><div><span className="eyebrow">{tab.toUpperCase()} · SELLER WORKSPACE</span><h2>{tab==='overview'?'Store overview':tab==='products'?'Product listings':tab==='storefront'?'Storefront profile':tab==='insights'?'Store insights':'Workspace settings'}</h2></div><Link to="/sell#seller-workspace" className="primary-btn">＋ Prepare a listing</Link></div>
    {tab==='overview'&&<><div className="seller-dashboard-stats"><article><span>CATALOGUE LISTINGS</span><b>{sellerProducts.length}</b><small>Sample products mapped to this shop</small></article><article><span>CATEGORIES</span><b>{new Set(sellerProducts.map(p=>p.category)).size}</b><small>Categories represented in demo data</small></article><article><span>STOREFRONT LOCATION</span><b>{seller.city}</b><small>Illustrative seller profile</small></article></div><div className="seller-dashboard-panels"><article className="seller-dashboard-panel"><div className="seller-dashboard-panel-heading"><div><span className="eyebrow">PRODUCT CATALOGUE</span><h3>Recently listed sample products</h3></div><button type="button" className="seller-dashboard-text-button" onClick={()=>setTab('products')}>View all →</button></div>{sellerProducts.slice(0,4).map(p=><div className="seller-dashboard-mini-row" key={p.id}><img src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category}</small></span><strong>{money(p.price)}</strong><span className="seller-dashboard-status">SAMPLE</span></div>)}</article><article className="seller-dashboard-panel seller-dashboard-checklist"><span className="eyebrow">STORE READINESS</span><h3>Prepare your storefront</h3><p>Use this checklist to organise the information a real seller workspace would need.</p><ul><li><span>01</span>Business information</li><li><span>02</span>Accurate product details</li><li><span>03</span>Delivery and return terms</li><li><span>04</span>Customer contact process</li></ul><Link to="/seller-help" className="text-link">Open seller guide →</Link></article></div></>}
    {tab==='products'&&<><div className="seller-dashboard-filters"><label><span>Search listings</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search product names or details"/></label><label><span>Category</span><select value={category} onChange={e=>setCategory(e.target.value)}>{categoriesForSeller.map(c=><option key={c}>{c}</option>)}</select></label><button type="button" onClick={()=>{setQuery('');setCategory('All')}}>Reset</button></div><div className="seller-dashboard-listings"><div className="seller-dashboard-listing-head"><span>PRODUCT</span><span>PRICE</span><span>STATUS</span><span>ACTION</span></div>{visible.map(p=><div className="seller-dashboard-listing-row" key={p.id}><div className="seller-dashboard-product-cell"><img src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category}</small></span></div><strong>{money(p.price)}</strong><span className="seller-dashboard-status">Sample listing</span><Link to={`/product/${p.id}`} className="seller-dashboard-row-link">Preview →</Link></div>)}{!visible.length&&<div className="seller-dashboard-empty"><b>No matching sample listings</b><p>Try another search or category.</p><button type="button" onClick={()=>{setQuery('');setCategory('All')}}>Clear filters</button></div>}</div><p className="seller-dashboard-note">These products are sample catalogue entries, not products owned or managed by this seller. Inventory editing and publishing are not connected.</p></>}
    {tab==='storefront'&&<div className="seller-dashboard-profile"><div className="seller-dashboard-cover"><span>{seller.name.split(' ').map(x=>x[0]).join('')}</span><small>STOREFRONT COVER PREVIEW</small></div><div className="seller-dashboard-profile-body"><span className="demo-label">DEMO STOREFRONT · NOT VERIFIED</span><h3>{seller.name}</h3><p>⌖ {seller.city}, Tunisia</p><p>{seller.description}</p><div className="seller-category-tags">{seller.categories.map(c=><span key={c}>{c}</span>)}</div><Link to={`/seller/${seller.slug}`} className="primary-btn">View public storefront →</Link></div></div>}
    {tab==='insights'&&<div className="seller-dashboard-empty large"><span>↗</span><h3>Insights will appear here.</h3><p>Views, clicks, conversion and sales metrics require real marketplace traffic and connected seller data. This preview does not invent performance figures.</p></div>}
    {tab==='settings'&&<div className="seller-dashboard-empty large"><span>⚙</span><h3>Workspace settings are not connected.</h3><p>Business verification, account security, notifications and payout settings would be managed here in a live seller portal.</p><Link to="/seller-help" className="text-link">Read seller preparation guide →</Link></div>}
   </section>
  </div>
  <p className="catalogue-note">Frontend demonstration only. No seller login, private data, live inventory, analytics, product publishing or account settings are connected.</p>
 </main>,language)
}

function SellerPreparationPage({language}) {
 return translateTree(<main id="main-content" className="shell page seller-preparation-page"><div className="breadcrumbs"><Link to="/">Home</Link> / <Link to="/sell">Sell on MARCHY</Link> / <span>Seller preparation</span></div><section className="seller-guide-hero"><span className="eyebrow">SELLER RESOURCE CENTRE</span><h1>Get your business ready to sell online.</h1><p>A practical preparation guide for Tunisian businesses considering a MARCHY storefront. These are planning recommendations, not active platform requirements.</p></section><div className="seller-guide-layout"><div className="seller-guide-content"><section><span>01</span><div><h2>Business information</h2><p>Prepare your trading name, business location, a short description of what you sell and a reliable customer contact channel. Keep business details consistent across your online presence.</p><ul><li>Storefront name and logo or visual identity</li><li>City and service area</li><li>Business contact details</li><li>Categories that accurately describe your products</li></ul></div></section><section><span>02</span><div><h2>Product information</h2><p>Customers need enough detail to understand exactly what they are considering.</p><ul><li>Clear product title and original photos</li><li>Accurate description, materials, dimensions and variants where relevant</li><li>Price in TND and clear notes about any additional charges</li><li>Realistic stock and availability information</li></ul></div></section><section><span>03</span><div><h2>Fulfilment and customer care</h2><p>Decide how orders would be handled before accepting them.</p><ul><li>Delivery areas, fees and expected handling times</li><li>How customers can ask questions</li><li>Return, exchange and refund terms</li><li>A process for keeping customers informed if something changes</li></ul></div></section><section><span>04</span><div><h2>Trust and accuracy</h2><p>Only publish claims you can substantiate. Do not label products as certified, original, locally made or in stock unless you can support those statements.</p><ul><li>Use real photos and current product details</li><li>Do not copy another seller's images or descriptions</li><li>Keep prices and availability up to date</li><li>Make limitations and conditions clear</li></ul></div></section></div><aside className="seller-guide-aside"><span className="eyebrow">YOUR NEXT STEP</span><h3>Prepare a storefront preview.</h3><p>Use the free planner to organise your business details and a first sample listing.</p><Link to="/sell#seller-workspace" className="primary-btn">Open storefront planner →</Link><div className="seller-guide-status"><b>Platform status</b><span>Seller applications are not currently accepted through this prototype.</span></div></aside></div></main>,language)
}

function AccountPage({cart,wishlist,language}) {
 const cartItems=cart.reduce((sum,item)=>sum+item.qty,0)
 const savedProducts=products.filter(p=>wishlist.includes(p.id)).slice(0,3)
 return translateTree(<main id="main-content" className="shell page account-page">
  <div className="breadcrumbs"><Link to="/">Home</Link> / <span>Account</span></div>
  <section className="account-welcome"><div><span className="eyebrow">YOUR MARCHY</span><h1>Your shopping space.</h1><p>Keep track of the products you're considering and pick up where you left off.</p></div><div className="account-guest-status"><span className="account-guest-avatar">G</span><div><b>Guest browsing</b><small>You're exploring without signing in</small><span className="demo-label">PREVIEW MODE</span></div></div></section>
  <div className="account-overview-grid">
   <Link to="/cart" className="account-overview-card"><span className="account-overview-icon">🛒</span><span><small>YOUR BASKET</small><b>{cartItems}</b><em>Items in cart</em></span><i>→</i></Link>
   <Link to="/wishlist" className="account-overview-card"><span className="account-overview-icon">♡</span><span><small>SAVED COLLECTION</small><b>{wishlist.length}</b><em>Saved products</em></span><i>→</i></Link>
   <Link to="/sellers" className="account-overview-card"><span className="account-overview-icon">▤</span><span><small>DISCOVER LOCAL</small><b>{sellers.length}</b><em>Sample storefronts</em></span><i>→</i></Link>
  </div>
  <div className="account-content-grid">
   <section className="account-panel"><div className="account-panel-heading"><div><span className="eyebrow">YOUR SHORTLIST</span><h2>Recently saved</h2></div><Link to="/wishlist" className="text-link">View all →</Link></div>
    {savedProducts.length?<div className="account-saved-list">{savedProducts.map(p=><Link to={`/product/${p.id}`} className="account-saved-item" key={p.id}><img src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category}</small></span><strong>{money(p.price)}</strong></Link>)}</div>:<div className="account-inline-empty"><span>♡</span><b>Your shortlist is empty</b><p>Save products with the heart button and they'll appear here.</p><Link to="/search" className="text-link">Explore products →</Link></div>}
   </section>
   <aside className="account-panel account-activity-panel"><span className="eyebrow">ACCOUNT ACTIVITY</span><h2>Orders & returns</h2><div className="account-activity-empty"><span>↗</span><b>No order history yet</b><p>Order tracking and returns aren't active in this frontend prototype. Your demo cart does not create an order.</p></div><Link to="/help" className="text-link">Visit help centre →</Link></aside>
  </div>
  <section className="account-shortcuts"><div><span className="eyebrow">QUICK LINKS</span><h2>Explore MARCHY</h2></div><div><Link to="/categories">Browse categories <span>→</span></Link><Link to="/delivery">Delivery information <span>→</span></Link><Link to="/returns">Returns information <span>→</span></Link><Link to="/help">Help & support <span>→</span></Link></div></section>
  <p className="catalogue-note">This is a guest-mode frontend preview. No account, personal profile, order history or authentication is created or stored.</p>
 </main>,language)
}

function MarketplaceGuidePage({type,language}) {
 const delivery=type==='delivery'
 const title=delivery?'Delivery, clearly agreed.':'Know the return terms first.'
 const intro=delivery?'Delivery coverage, fees and timing can vary by seller. Confirm the details directly before placing any order.':'Return, exchange and refund terms may vary by seller. Agree the exact conditions before purchasing.'
 const items=delivery?[
  {title:'Delivery coverage',copy:'Confirm whether the seller delivers to your city, neighbourhood or preferred address.'},
  {title:'Total delivery cost',copy:'Ask whether the delivery fee is separate from the displayed product price and whether extra charges may apply.'},
  {title:'Estimated timing',copy:'Confirm preparation time, delivery window and how delays or failed delivery attempts are handled.'},
  {title:'Handover and inspection',copy:'Ask how the item will be handed over and whether you can inspect it before accepting it.'}
 ]:[
  {title:'Eligible return reasons',copy:'Ask which situations qualify for a return, exchange or refund, including damaged, incorrect or unsuitable items.'},
  {title:'Time limits',copy:'Confirm the number of days allowed and when that period starts.'},
  {title:'Item condition',copy:'Ask whether packaging, tags, accessories and proof of purchase must be retained.'},
  {title:'Costs and refund method',copy:'Confirm who pays return delivery and how and when an approved refund would be issued.'}
 ]
 return translateTree(<main id="main-content" className="shell page marketplace-guide-page">
  <div className="breadcrumbs"><Link to="/">Home</Link> / <Link to="/help">Help & support</Link> / <span>{delivery?'Delivery':'Returns & refunds'}</span></div>
  <section className="marketplace-guide-hero"><span className="eyebrow">{delivery?'DELIVERY INFORMATION':'RETURNS & REFUNDS'}</span><h1>{title}</h1><p>{intro}</p><span className="guide-status-pill">PRE-LAUNCH INFORMATION · NO ACTIVE TRANSACTIONS</span></section>
  <div className="marketplace-guide-layout"><section className="guide-checklist"><div className="guide-section-heading"><span className="eyebrow">BUYER CHECKLIST</span><h2>{delivery?'What to confirm before delivery':'What to agree before you buy'}</h2><p>Use these points as a practical checklist when discussing a purchase with a seller.</p></div>{items.map((item,index)=><article className="guide-checklist-item" key={item.title}><span>{String(index+1).padStart(2,'0')}</span><div><h3>{item.title}</h3><p>{item.copy}</p></div></article>)}</section>
  <aside className="guide-note-panel"><span className="eyebrow">MARCHY STATUS</span><h2>This feature isn't active yet.</h2><p>MARCHY currently displays sample products and storefronts. It does not calculate delivery fees, arrange shipments, process returns or issue refunds.</p><div><b>Before any real purchase</b><span>Get the seller's terms in writing and keep a copy of your agreement.</span></div><Link to="/help" className="text-link">More help & FAQs →</Link></aside></div>
  <section className="guide-bottom-cta"><div><span className="eyebrow">NEED MORE CONTEXT?</span><h2>Check the product and seller details.</h2><p>Review the sample listing and storefront, then confirm all current information directly with the seller.</p></div><div><Link to="/search" className="primary-btn">Browse products →</Link><Link to="/sellers" className="outline-btn">Find storefronts</Link></div></section>
 </main>,language)
}

function HelpCenterPage({language}) {
 const topics=[
  {q:'Are the product prices and discounts live?',a:'No. The catalogue is illustrative. Displayed prices and previous prices are sample data and must not be treated as current seller offers.'},
  {q:'Can I place an order or pay on MARCHY?',a:'Not yet. The cart is a frontend preview only. Checkout, payments, order confirmation and seller stock checks are not connected.'},
  {q:'How can I confirm a product before buying?',a:'Open the product page and visit its sample storefront. In a live marketplace, buyers should confirm specifications, availability, final price and terms directly with the seller.'},
  {q:'Are the storefronts verified?',a:'No. The seller profiles currently shown are sample storefronts created for the frontend prototype. They have not been independently verified.'},
  {q:'How do delivery and returns work?',a:'Delivery and return services are not active in this prototype. The information pages explain what buyers should confirm before any future transaction.'},
  {q:'Can I register as a seller?',a:'Seller onboarding is not open yet. You can use the storefront planner and seller preparation guide to organise sample business and product information.'}
 ]
 return translateTree(<main id="main-content" className="shell page help-center-page">
  <div className="breadcrumbs"><Link to="/">Home</Link> / <span>Help & support</span></div>
  <section className="help-center-hero"><span className="eyebrow">MARCHY SUPPORT</span><h1>Answers before you shop.</h1><p>Find out how the marketplace preview works and what to check before making a purchase decision.</p><Link to="/search" className="primary-btn">Explore the marketplace →</Link></section>
  <div className="help-center-layout"><section className="help-faq-section"><div className="help-section-heading"><span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span><h2>Good to know</h2><p>Clear answers about the current MARCHY frontend prototype.</p></div><div className="help-faq-list">{topics.map((item,index)=><details className="help-faq-item" key={item.q} open={index===0}><summary><span>{item.q}</span><i>＋</i></summary><p>{item.a}</p></details>)}</div></section>
  <aside className="help-topic-panel"><span className="eyebrow">HELP TOPICS</span><h2>Find the right information.</h2><Link to="/delivery"><span>⌖</span><div><b>Delivery information</b><small>What to confirm about coverage, fees and timing</small></div><i>→</i></Link><Link to="/returns"><span>↩</span><div><b>Returns & refunds</b><small>Understand the current prototype limitations</small></div><i>→</i></Link><Link to="/seller-help"><span>▤</span><div><b>Seller preparation</b><small>Prepare a business and product listing</small></div><i>→</i></Link><div className="help-status-note"><b>Platform status</b><p>MARCHY is a frontend prototype. No support tickets, purchases or seller applications are currently processed.</p></div></aside></div>
 </main>,language)
}

function SimplePage({ title, eyebrow, text, language }) { return translateTree(<main id="main-content" className="shell page simple-page"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="muted">{text}</p><Link to="/search" className="primary-btn">Explore the marketplace →</Link></main>,language) }

function Footer({language}){return translateTree(<footer className="footer"><div className="shell footer-main"><div className="footer-brand"><Link to="/" className="logo">MARCHY<span>.</span></Link><p>Tunisia’s marketplace for everyday discoveries.<br/>Discover local sellers and products in one place.</p></div><div><b>Discover</b><Link to="/search">All products</Link><Link to="/categories">Categories</Link><Link to="/wishlist">Wishlist</Link><Link to="/sellers">Find sellers</Link><Link to="/search?deal=true">Today’s deals</Link></div><div><b>Help & support</b><Link to="/help">Contact us</Link><Link to="/delivery">Delivery information</Link><Link to="/returns">Returns & refunds</Link></div><div><b>For sellers</b><Link to="/sellers">Seller directory</Link><Link to="/sell">Sell on MARCHY</Link><Link to="/seller-help">Seller help</Link></div></div><div className="shell footer-bottom"><span>© 2026 MARCHY. All rights reserved.</span><span>Built for Tunisia.</span></div></footer>,language)}

function MobileTabBar({cartCount,wishlistCount,language}) {
 const {pathname}=useLocation()
 const active=path=>path==='/'?pathname==='/':pathname===path||pathname.startsWith(path+'/')
 return translateTree(<nav className="mobile-tabbar" aria-label="Quick navigation"><Link to="/" className={active('/')?'is-active':''} aria-current={active('/')?'page':undefined}><span>⌂</span><small>Home</small></Link><Link to="/search" className={active('/search')||active('/category')?'is-active':''} aria-current={active('/search')||active('/category')?'page':undefined}><span>⌕</span><small>Search</small></Link><Link to="/sellers" className={active('/sellers')||active('/seller')?'is-active':''} aria-current={active('/sellers')||active('/seller')?'page':undefined}><span>▤</span><small>Sellers</small></Link><Link to="/wishlist" className={active('/wishlist')?'is-active':''} aria-current={active('/wishlist')?'page':undefined}><span>♡<i>{wishlistCount}</i></span><small>Saved</small></Link><Link to="/cart" className={active('/cart')?'is-active':''} aria-current={active('/cart')?'page':undefined}><span>🛒<i>{cartCount}</i></span><small>Cart</small></Link></nav>,language)
}

function App(){
  const [language,setLanguage]=useState(()=>{const saved=readText('marchy-language','en');return ['en','fr','ar'].includes(saved)?saved:'en'}); const [query,setQuery]=useState(''); const [cart,setCart]=useState(()=>readJson('marchy-cart',[])); const [wishlist,setWishlist]=useState(()=>readJson('marchy-wishlist',[]))
  useEffect(()=>{try{localStorage.setItem('marchy-language',language)}catch{} document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr'},[language])
  useEffect(()=>{writeJson('marchy-cart',cart)},[cart])
  useEffect(()=>{writeJson('marchy-wishlist',wishlist)},[wishlist])
  function addToCart(product,qty=1){setCart(prev=>{const found=prev.find(x=>x.id===product.id);return found?prev.map(x=>x.id===product.id?{...x,qty:x.qty+qty}:x):[...prev,{...product,qty}]})}
  function updateQty(id,qty){if(qty<1)return;setCart(prev=>prev.map(x=>x.id===id?{...x,qty}:x))}
  function removeItem(id){setCart(prev=>prev.filter(x=>x.id!==id))}
  function toggleWish(id){setWishlist(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id])}
  return <div className={language==='ar'?'app-root is-rtl':'app-root'} dir={language==='ar'?'rtl':'ltr'}><ScrollToTop/><a className="skip-to-content" href="#main-content">Skip to main content</a><Header cartCount={cart.reduce((s,x)=>s+x.qty,0)} query={query} setQuery={setQuery} language={language} setLanguage={setLanguage}/><Routes><Route path="/" element={<Home addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/search" element={<SearchPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/category/:category" element={<SearchPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/product/:id" element={<ProductPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/cart" element={<CartPage cart={cart} updateQty={updateQty} removeItem={removeItem} language={language}/>}/><Route path="/wishlist" element={<WishlistPage products={products} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} language={language}/>}/><Route path="/categories" element={<CategoriesPage language={language}/>}/><Route path="/sellers" element={<SellersPage language={language}/>}/><Route path="/seller/:slug" element={<SellerPage language={language} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish}/>}/><Route path="/account" element={<AccountPage cart={cart} wishlist={wishlist} language={language}/>}/><Route path="/help" element={<HelpCenterPage language={language}/>}/><Route path="/delivery" element={<MarketplaceGuidePage type="delivery" language={language}/>}/><Route path="/returns" element={<MarketplaceGuidePage type="returns" language={language}/>}/><Route path="/seller-help" element={<SellerPreparationPage language={language}/>}/><Route path="/sell" element={<SellerLaunchPage language={language}/>}/><Route path="/seller-dashboard" element={<SellerDashboardPage language={language}/>}/><Route path="*" element={<SimplePage language={language} eyebrow="404" title="We couldn't find that page." text="The page may have moved, or the link may be incorrect."/>}/></Routes><Footer language={language}/><MobileTabBar cartCount={cart.reduce((s,x)=>s+x.qty,0)} wishlistCount={wishlist.length} language={language}/></div>
}

export default App