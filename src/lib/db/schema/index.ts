import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, jsonb, pgEnum, real } from "drizzle-orm/pg-core";
			
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  // name: text('name').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image').default("pfp.png"),
  isAnonymous: boolean('isAnonymous').default(false),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const userRelations = relations(user, ({ many, one }) => ({
  ankiPresets: many(ankiPreset),
  subtitleSettings: one(subtitleSettings, {
    fields: [user.id],
    references: [subtitleSettings.userId]
  }),
  subtitleStyles: one(subtitleStyles, {
    fields: [user.id],
    references: [subtitleStyles.userId]
  }),
  playerSettings: one(playerSettings, {
    fields: [user.id],
    references: [playerSettings.userId]
  }),
}))

export const ankiPreset = pgTable('anki_preset', {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  deck: text('deck').notNull(),
  model: text('model').notNull(),
  fields: jsonb(),
  isDefault: boolean('is_default').default(false),
  isGui: boolean('is_gui').default(false),
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
})

export const ankiPresetRelations = relations(ankiPreset, ({ one }) => ({
  user: one(user, {
    fields: [ankiPreset.userId],
    references: [user.id]
  })
}))

export const subtitleFormatEnum = pgEnum("subtitle_format", [
  "srt",
  "vtt",
  "ass",
]);

export const subtitleSettings = pgTable("subtitle_settings", {
  id: text("id").primaryKey(),
  
  preferredFormat: subtitleFormatEnum('preferred_format'),
  matchPattern: text("match_pattern"), // fileNameMatchPattern
  transcriptionOrder: text('transcription_order').array(),
  // .default(["hiragana","katakana","romaji","japanese","english"])

  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});

export const subtitleSettingsRelations = relations(subtitleSettings, ({ one }) => ({
  user: one(user, {
    fields: [subtitleSettings.userId],
    references: [user.id]
  })
}))

export const textShadowEnum = pgEnum("text_shadow_enum", [
  "none",
  "drop-shadow",
  "raised",
  "depressed",
  "outline"
]);

export const subtitleTranscriptionEnum = pgEnum("subtitle_transcription", [
  "all",
  "japanese",
  "hiragana",
  "katakana",
  "romaji",
  "english",
]);

export const subtitleStyles = pgTable("subtitle_styles", {
  id: text("id").primaryKey(),
  
  fontSize: real("font_size").notNull().default(16),
  fontFamily: text("font_family").notNull().default('arial'),
  
  textColor: text("text_color").notNull().default('#FFFFFF'),
  textOpacity: real("text_opacity").notNull().default(1),
  textShadow: textShadowEnum("text_shadow").notNull().default('outline'),

  backgroundColor: text("background_color").notNull().default('#000000'),
  backgroundOpacity: real("background_opacity").notNull().default(1),
  backgroundBlur: real("background_blur").notNull().default(0.2),
  backgroundRadius: real("background_radius").notNull().default(6),
  
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  transcription: subtitleTranscriptionEnum("transcription").notNull().default('all'),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});

export const subtitleStylesRelations = relations(subtitleStyles, ({ one }) => ({
  user: one(user, {
    fields: [subtitleStyles.userId],
    references: [user.id]
  })
}))

export const transcriptionEnum = pgEnum("transcription_enum", [
  "japanese",
  "hiragana",
  "katakana",
  "romaji",
  "english",
])

export const playerSettings = pgTable("player_settings", {
  id: text("id").primaryKey(),

  autoPlay: boolean('auto_play').notNull().default(false),
  autoNext: boolean('auto_next').notNull().default(false),
  autoSkip: boolean('auto_skip').notNull().default(false),

  enabledTranscriptions: transcriptionEnum('enabled_transcriptions').array().notNull().default(["japanese", "english"]),

  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});

export const playerSettingsRelations = relations(subtitleStyles, ({ one }) => ({
  user: one(user, {
    fields: [subtitleStyles.userId],
    references: [user.id]
  })
}))

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

export type User = InferSelectModel<typeof user>;
export type AnkiPreset = Omit<InferSelectModel<typeof ankiPreset>, 'fields'> & {
  fields: Record<string, string>;
};
export type SubtitleStyles = InferSelectModel<typeof subtitleStyles>
export type SubtitleSettings = InferSelectModel<typeof subtitleSettings>
export type PlayerSettings = InferSelectModel<typeof playerSettings>