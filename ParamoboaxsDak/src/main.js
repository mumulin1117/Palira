import { createApp } from 'vue'
import PaliroEntryApp from './PaliroEntryApp.vue'
import './style.css'
import './paliroMotion.css'
import './paliroInteraction.css'
import { installPaliroInteractionGuards } from './services/paliroInteractionGuards.js'

const removeInteractionGuards = installPaliroInteractionGuards()
if (import.meta.hot) import.meta.hot.dispose(removeInteractionGuards)

createApp(PaliroEntryApp).mount('#app')
