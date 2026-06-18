targetScope = 'resourceGroup'

@description('Name of the Static Web App resource.')
param staticWebAppName string

@description('Azure region for the Static Web App (e.g. eastus2).')
param location string

@description('SKU tier for the Static Web App.')
@allowed([
  'Free'
  'Standard'
])
param skuName string

@description('Tag identifying the owning team, for cost attribution.')
param ownerTag string

resource staticWebApp 'Microsoft.Web/staticSites@2024-04-01' = {
  name: staticWebAppName
  location: location
  tags: {
    owner: ownerTag
  }
  sku: {
    name: skuName
    tier: skuName
  }
  properties: {
    allowConfigFileUpdates: true
  }
}

output staticWebAppName string = staticWebApp.name
output defaultHostname string = staticWebApp.properties.defaultHostname
