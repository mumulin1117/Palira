import type { PaliroAccounts, PaliroProfilePatch, PaliroRegistration } from './paliroAccounts.js'
import { paliroAuthSchema, paliroProfileProperties, paliroRegistrationSchema, paliroUserSchema } from './paliroSchemas.js'

const profileNames: Record<string, string> = {
  nickname: 'palirovdisplayName', avatar: 'palirovavatarKey', birthday: 'palirovbirthDate',
  bio: 'palirovaboutMe', interests: 'palirovinterestTags', mood: 'palirovcurrentMood',
  language: 'palirovpreferredLanguage', gender: 'gender',
}
const localNames = Object.fromEntries(Object.entries(profileNames).map(([local, wire]) => [wire, local]))
const rename = (value: object, names: Record<string, string>) => Object.fromEntries(
  Object.entries(value).map(([key, field]) => [names[key] ?? key, field]),
)
const renameRequired = (keys: string[]) => keys.map(key => profileNames[key] ?? key)
const memberName = { profile: 'palirovmemberProfile' }

export const paliroWireProfileProperties = rename(paliroProfileProperties, profileNames)
export const paliroWireUserSchema = {
  ...paliroUserSchema, $id: 'PaliroWireUser',
  required: paliroUserSchema.required.map(key => memberName[key as keyof typeof memberName] ?? key),
  properties: rename({ ...paliroUserSchema.properties, profile: {
    ...paliroUserSchema.properties.profile,
    required: renameRequired(paliroUserSchema.properties.profile.required),
    properties: rename(paliroUserSchema.properties.profile.properties, profileNames),
  } }, memberName),
}
export const paliroWireAuthSchema = {
  ...paliroAuthSchema, properties: { ...paliroAuthSchema.properties, user: { $ref: 'PaliroWireUser#' } },
}
export const paliroWireRegistrationSchema = {
  ...paliroRegistrationSchema,
  required: paliroRegistrationSchema.required.map(key => key === 'profile' ? 'palirovmemberProfile' : key),
  properties: rename({ ...paliroRegistrationSchema.properties, profile: {
    ...paliroRegistrationSchema.properties.profile,
    required: renameRequired(paliroRegistrationSchema.properties.profile.required),
    properties: rename(paliroRegistrationSchema.properties.profile.properties, profileNames),
  } }, memberName),
  examples: paliroRegistrationSchema.examples.map(({ profile, ...registration }) => ({
    ...registration, palirovmemberProfile: rename(profile, profileNames),
  })),
}

export interface PaliroWireRegistration extends Omit<PaliroRegistration, 'profile'> {
  palirovmemberProfile: Record<string, unknown>
}
// Route schemas validate the external contract before it reaches the existing account service.
export function paliroFromWireProfile(profile: Record<string, unknown>): PaliroProfilePatch {
  return rename(profile, localNames) as PaliroProfilePatch
}
export function paliroFromWireRegistration({ palirovmemberProfile, ...registration }: PaliroWireRegistration): PaliroRegistration {
  return { ...registration, profile: paliroFromWireProfile(palirovmemberProfile) as Required<PaliroProfilePatch> }
}
export function paliroToWireUser({ profile, ...user }: Awaited<ReturnType<PaliroAccounts['me']>>) {
  return { ...user, palirovmemberProfile: rename(profile, profileNames) }
}
