import { cloneElement, Children, isValidElement, useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
const normalizeSearchText = value => String(value || '').toLocaleLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^\\p{L}\\p{N}]+/gu, ' ').trim()
const searchTextMatches = (text, query) => {
  const normalized = normalizeSearchText(text)
  const cleanedQuery = normalizeSearchText(query)
  if (!cleanedQuery) return true
  if (normalized.includes(cleanedQuery)) return true
  const words = cleanedQuery.split(/\\s+/).filter(Boolean)
  return words.every(word => {
    const variants = [word, ...Object.entries(searchSynonyms).filter(([key, values]) => key === word || values.some(value => normalizeSearchText(value) === word)).flatMap(([key, values]) => [key, ...values].map(normalizeSearchText))]
    return variants.some(variant => normalized.split(' ').some(token => token === variant || token.startsWith(variant) || variant.startsWith(token)))
  })
}
const readText = (key, fallback) => { try { const value = localStorage.getItem(key); return value || fallback } catch { return fallback } }
const readJson = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value ?? fallback } catch { return fallback } }
const writeJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }

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
      <form className="searchbar" onSubmit={submit} role="search"><span className="search-symbol">⌕</span><input value={query} onFocus={()=>setSearchOpen(true)} onChange={e => {setQuery(e.target.value);setSearchOpen(true)}} placeholder="Search products, brands and local finds…" aria-label="Search products" aria-expanded={searchOpen} aria-controls="global-search-suggestions" /><button type="submit">Search</button>
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

function ProductCard({ product, addToCart, wished, toggleWish, language }) {
  const [added,setAdded]=useState(false)
  const seller=sellerForProduct(product)
  const discount=product.oldPrice?Math.round((1-product.price/product.oldPrice)*100):0
  function quickAdd(){addToCart(product);setAdded(true)}
  return translateTree(<article className="product-card">
    <div className="product-photo">
      <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}><img src={product.image} alt={product.name} loading="lazy" /></Link>
      <span className="product-tag">SAMPLE</span>
      {discount>0&&<span className="discount-tag">-{discount}%</span>}
      <button type="button" className={`wish-btn ${wished?'wished':''}`} onClick={()=>toggleWish(product.id)} aria-label={wished?'Remove from wishlist':'Add to wishlist'} aria-pressed={wished}>{wished?'♥':'♡'}</button>
    </div>
    <div className="product-info">
      <div className="product-category">{product.category}</div>
      <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
      <Link to={`/seller/${seller.slug}`} className="seller-name seller-link">⌖ {seller.name} · {seller.city}</Link>
      <div className="price-row"><strong>{money(product.price)}</strong>{product.oldPrice&&<del>{money(product.oldPrice)}</del>}</div>
            <button type="button" className={`add-btn ${added?'added':''}`} onClick={quickAdd} aria-live="polite">{added?'Added to cart ✓':'Add to cart'} <span>{added?'✓':'＋'}</span></button>
    </div>
  </article>,language)
}

function Home({ addToCart, wishlist, toggleWish, language }) {
  const [active,setActive]=useState('All')
  const shown=(active==='All'?products:products.filter(p=>p.category===active)).slice(0,8)
  const populatedCategories=categories.slice(1).filter(name=>products.some(p=>p.category===name))
  const popular=populatedCategories.map((name,i)=>({name,count:products.filter(p=>p.category===name).length,icon:['⌘','◉','✳','⌂','✿','↗','◇','▤','▣','✦','♧','♢','⌁'][i%13],tone:['cat-blue','cat-sand','cat-pink','cat-lilac','cat-green','cat-yellow'][i%6]}))
  const deals=products.filter(p=>p.oldPrice).slice(0,4)
  return translateTree(<main className="shell page home-page">
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
  const removeCategoryFilter = () => {
    if (routeCategory) navigate('/search')
    else setCategory('All')
  }
  if (isInvalidCategory) return translateTree(<main className='shell page'><div className='breadcrumbs'><Link to='/'>Home</Link> / <Link to='/categories'>Categories</Link></div><div className='empty-state'><span>⌕</span><h2>Category not found</h2><p>This category does not exist in the MARCHY catalogue.</p><Link to='/categories' className='primary-btn'>Browse all categories →</Link></div></main>, language)
  return translateTree(<main className="shell page">
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
        {results.length ? <><div className="product-grid">{visibleResults.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language}/>)}</div>{pageCount > 1 && <nav className="pagination" aria-label="Product pages"><button disabled={page === 1} onClick={() => setPage(v => Math.max(1, v - 1))}>← Previous</button><span>Page {page} of {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage(v => Math.min(pageCount, v + 1))}>Next →</button></nav>}</> : <div className="empty-state"><span>⌕</span><h3>No products found</h3><p>Try a broader search, choose another category or reset your price and location filters.</p><button className="outline-btn" onClick={clearFilters}>Reset all filters</button></div>}
      </section>
    </div>
  </main>, language)
}

function ProductPage({ addToCart, wishlist, toggleWish, language }) {
  const { id } = useParams()
  const product = products.find(p => p.id === Number(id))
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  if (!product) return translateTree(<main className="shell page empty-state"><span>⌕</span><h2>Product not found</h2><p>This listing may have moved or is no longer available in the sample catalogue.</p><Link to="/search" className="primary-btn">Back to marketplace →</Link></main>, language)
  const seller = sellerForProduct(product)
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
  const saved = wishlist.includes(product.id)
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0
  const handleAdd = () => { addToCart(product, qty); setAdded(true) }
  return translateTree(<main className="shell page product-page">
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
  return translateTree(<main className="shell page cart-page">
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
  return translateTree(<main className="shell page wishlist-page">
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
 return translateTree(<main className="shell page"><div className="breadcrumbs"><Link to="/">Home</Link> / Sellers</div><section className="seller-directory-hero"><span className="eyebrow">DISCOVER LOCAL BUSINESSES</span><h1>Meet the sellers behind the finds.</h1><p>Explore sample storefronts from across Tunisia. Profiles and listings are demonstration content, not verified businesses.</p><div className="seller-directory-stats"><span><b>{sellers.length}</b><small>Sample storefronts</small></span><span><b>{new Set(sellers.map(s=>s.city)).size}</b><small>Locations represented</small></span><span><b>{products.length}</b><small>Sample listings</small></span></div></section><div className="seller-directory-grid">{sellers.map(s=><article className="seller-directory-card" key={s.slug}><div className="seller-card-top"><span className="seller-avatar large">{s.name.slice(0,1)}</span><span className="demo-label">DEMO STOREFRONT</span></div><h2>{s.name}</h2><p className="seller-location">⌖ {s.city}, Tunisia</p><p>{s.tagline}</p><div className="seller-category-tags">{s.categories.map(c=><span key={c}>{c}</span>)}</div><Link to={`/seller/${s.slug}`} className="seller-visit-link">View storefront <span>→</span></Link></article>)}</div></main>,language)
}
function SellerPage({language,addToCart,wishlist,toggleWish}) {
 const {slug}=useParams(); const seller=sellers.find(s=>s.slug===slug)
 const [search,setSearch]=useState(''); const [category,setCategory]=useState('All'); const [sort,setSort]=useState('featured')
 if(!seller)return <main className="shell page empty-state"><h2>Storefront not found</h2><Link to="/sellers" className="text-link">Browse sellers →</Link></main>
 const items=products.filter(p=>sellerForProduct(p).slug===seller.slug)
 const storeCategories=['All',...new Set(items.map(p=>p.category))]
 const visibleItems=items.filter(p=>(category==='All'||p.category===category)&&(!search.trim()||p.name.toLowerCase().includes(search.trim().toLowerCase()))).sort((a,b)=>sort==='low'?a.price-b.price:sort==='high'?b.price-a.price:0)
 return translateTree(<main className="shell page seller-store-page"><div className="breadcrumbs"><Link to="/">Home</Link> / <Link to="/sellers">Sellers</Link> / {seller.name}</div><section className="seller-store-hero"><div className="seller-store-cover"><span className="seller-cover-wordmark">{seller.name.split(' ').map(x=>x[0]).join('')}</span><span className="seller-cover-caption">LOCAL FINDS · MARCHY STOREFRONT</span></div><div className="seller-store-identity"><span className="seller-avatar store-avatar">{seller.name.slice(0,1)}</span><div><span className="demo-label">DEMO STOREFRONT · NOT VERIFIED</span><h1>{seller.name}</h1><p>⌖ {seller.city}, Tunisia</p></div></div><p className="seller-store-tagline">{seller.tagline}</p><p className="muted">{seller.description}</p><div className="seller-category-tags">{seller.categories.map(c=><Link key={c} to={`/category/${encodeURIComponent(c.toLowerCase())}`}>{c}</Link>)}</div><div className="seller-store-meta"><span><b>{items.length}</b> sample listings</span><span>Seller information requires confirmation</span></div></section><div className="section-heading seller-products-heading"><div><span className="eyebrow">SHOP THIS STOREFRONT</span><h2>Products from {seller.name}</h2><p className="muted">{visibleItems.length} of {items.length} illustrative listings</p></div><Link to="/sellers" className="text-link">All sellers →</Link></div><div className="store-product-tools"><div className="store-category-filters" role="group" aria-label="Filter storefront products">{storeCategories.map(c=><button type="button" key={c} className={category===c?'active':''} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="store-search-sort"><label className="store-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search this storefront…" aria-label="Search this storefront"/></label><label className="store-sort-label"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort storefront products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div></div>{visibleItems.length?<div className="product-grid">{visibleItems.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language}/>)}</div>:<div className="empty-state store-no-results"><h3>No matching products</h3><p>Try another search or select a different category.</p><button type="button" className="outline-btn" onClick={()=>{setSearch('');setCategory('All')}}>Clear storefront filters</button></div>}<p className="storefront-demo-note">This is a demonstration storefront. Seller identity, product details, availability, prices and delivery terms have not been independently verified.</p></main>,language)
}

function CategoriesPage({language}) {
 const icons=['⌘','◉','✳','⌂','✿','↗','◇','▤','▣','✦','♧','♢','⌁']
 const tones=['cat-blue','cat-sand','cat-pink','cat-lilac','cat-green','cat-yellow']
 return translateTree(<main className="shell page categories-page"><div className="breadcrumbs"><Link to="/">Home</Link> / Categories</div><section className="categories-intro"><span className="eyebrow">EXPLORE MARCHY</span><h1>Find your category.</h1><p>Browse the catalogue by what you need. Every category opens a dedicated product results view.</p><div className="category-total"><b>{categories.length-1}</b><span>everyday categories</span></div></section><div className="category-directory-grid">{categories.slice(1).map((name,i)=>{const count=products.filter(p=>p.category===name).length;return <Link to={`/category/${encodeURIComponent(name.toLowerCase())}`} className="category-directory-card" key={name}><span className={`category-directory-icon ${tones[i%tones.length]}`}>{icons[i%icons.length]}</span><span className="category-directory-copy"><b>{name}</b><small>{count} sample {count===1?'listing':'listings'}</small></span><span className="category-directory-arrow">→</span></Link>})}</div><div className="categories-bottom-cta"><div><b>Not sure where to start?</b><span>Browse the full sample catalogue and use filters to narrow your search.</span></div><Link to="/search" className="primary-btn">Explore all products →</Link></div></main>,language)
}

function SimplePage({ title, eyebrow, text, language }) { return translateTree(<main className="shell page simple-page"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="muted">{text}</p><Link to="/search" className="primary-btn">Explore the marketplace →</Link></main>,language) }

function Footer({language}){return translateTree(<footer className="footer"><div className="shell footer-main"><div className="footer-brand"><Link to="/" className="logo">MARCHY<span>.</span></Link><p>Tunisia’s marketplace for everyday discoveries.<br/>Discover local sellers and products in one place.</p></div><div><b>Discover</b><Link to="/search">All products</Link><Link to="/categories">Categories</Link><Link to="/wishlist">Wishlist</Link><Link to="/sellers">Find sellers</Link><Link to="/search?deal=true">Today’s deals</Link></div><div><b>Help & support</b><Link to="/help">Contact us</Link><Link to="/delivery">Delivery information</Link><Link to="/returns">Returns & refunds</Link></div><div><b>For sellers</b><Link to="/sellers">Seller directory</Link><Link to="/sell">Sell on MARCHY</Link><Link to="/seller-help">Seller help</Link></div></div><div className="shell footer-bottom"><span>© 2026 MARCHY. All rights reserved.</span><span>Built for Tunisia.</span></div></footer>,language)}

function MobileTabBar({cartCount,wishlistCount,language}) {
 return translateTree(<nav className="mobile-tabbar" aria-label="Quick navigation"><Link to="/"><span>⌂</span><small>Home</small></Link><Link to="/search"><span>⌕</span><small>Search</small></Link><Link to="/sellers"><span>▤</span><small>Sellers</small></Link><Link to="/wishlist"><span>♡<i>{wishlistCount}</i></span><small>Saved</small></Link><Link to="/cart"><span>🛒<i>{cartCount}</i></span><small>Cart</small></Link></nav>,language)
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
  return <div className={language==='ar'?'app-root is-rtl':'app-root'} dir={language==='ar'?'rtl':'ltr'}><Header cartCount={cart.reduce((s,x)=>s+x.qty,0)} query={query} setQuery={setQuery} language={language} setLanguage={setLanguage}/><Routes><Route path="/" element={<Home addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/search" element={<SearchPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/category/:category" element={<SearchPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/product/:id" element={<ProductPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/cart" element={<CartPage cart={cart} updateQty={updateQty} removeItem={removeItem} language={language}/>}/><Route path="/wishlist" element={<WishlistPage products={products} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} language={language}/>}/><Route path="/categories" element={<CategoriesPage language={language}/>}/><Route path="/sellers" element={<SellersPage language={language}/>}/><Route path="/seller/:slug" element={<SellerPage language={language} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish}/>}/><Route path="/account" element={<SimplePage language={language} eyebrow="YOUR MARCHY" title="Your account, all in one place." text="Account, saved items and order history will connect here when authentication and backend services are added."/>}/><Route path="/help" element={<SimplePage language={language} eyebrow="HELP & SUPPORT" title="How can we help?" text="MARCHY support channels will be published when the marketplace is ready to accept customers. This prototype does not process support requests."/>}/><Route path="/delivery" element={<SimplePage language={language} eyebrow="DELIVERY INFORMATION" title="Delivery details are confirmed by each seller." text="Delivery coverage, fees and timing are not connected to live seller systems yet. Confirm these details directly with the seller before ordering."/>}/><Route path="/returns" element={<SimplePage language={language} eyebrow="RETURNS & REFUNDS" title="Returns information is not active yet." text="MARCHY has not launched transaction or returns processing. Agree return terms directly with the seller before any purchase."/>}/><Route path="/seller-help" element={<SimplePage language={language} eyebrow="SELLER HELP" title="Seller tools are coming later." text="Seller onboarding, listing management and support tools are not connected in this frontend prototype."/>}/><Route path="/sell" element={<SimplePage language={language} eyebrow="SELL ON MARCHY" title="Bring your products to more people." text="Seller onboarding and storefront tools are planned for a later phase. This frontend is currently a visual prototype."/>}/><Route path="*" element={<SimplePage language={language} eyebrow="404" title="We couldn't find that page." text="The page may have moved, or the link may be incorrect."/>}/></Routes><Footer language={language}/><MobileTabBar cartCount={cart.reduce((s,x)=>s+x.qty,0)} wishlistCount={wishlist.length} language={language}/></div>
}

export default App