import { useMarketplace } from './MarketplaceContext'

export function connectMarketplacePage(PageComponent) {
  function MarketplaceConnectedPage(props) {
    const marketplace = useMarketplace()
    return <PageComponent {...marketplace} {...props} />
  }
  MarketplaceConnectedPage.displayName = `MarketplaceConnected(${PageComponent.displayName || PageComponent.name || 'Page'})`
  return MarketplaceConnectedPage
}
