export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          country_code: string | null
          created_at: string
          diff: Json
          id: number
          row_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          country_code?: string | null
          created_at?: string
          diff: Json
          id?: never
          row_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          country_code?: string | null
          created_at?: string
          diff?: Json
          id?: never
          row_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_business_lines: {
        Row: {
          brand_id: string
          business_line_id: string
        }
        Insert: {
          brand_id: string
          business_line_id: string
        }
        Update: {
          brand_id?: string
          business_line_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_business_lines_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_business_lines_business_line_id_fkey"
            columns: ["business_line_id"]
            isOneToOne: false
            referencedRelation: "business_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          description_en: string | null
          description_es: string | null
          id: string
          is_active: boolean
          logo_is_thin: boolean
          logo_media_id: string | null
          name: string
          origin_country: string | null
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          id?: string
          is_active?: boolean
          logo_is_thin?: boolean
          logo_media_id?: string | null
          name: string
          origin_country?: string | null
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          id?: string
          is_active?: boolean
          logo_is_thin?: boolean
          logo_media_id?: string | null
          name?: string
          origin_country?: string | null
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      business_lines: {
        Row: {
          cover_media_id: string | null
          created_at: string
          description_en: string | null
          description_es: string | null
          id: string
          name_en: string | null
          name_es: string
          slug: string
          slug_en: string | null
          sort: number
          updated_at: string
        }
        Insert: {
          cover_media_id?: string | null
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          id?: string
          name_en?: string | null
          name_es: string
          slug: string
          slug_en?: string | null
          sort?: number
          updated_at?: string
        }
        Update: {
          cover_media_id?: string | null
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          id?: string
          name_en?: string | null
          name_es?: string
          slug?: string
          slug_en?: string | null
          sort?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_lines_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_brands: {
        Row: {
          brand_id: string | null
          country_code: string
          created_at: string
          erp_ref: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          country_code: string
          created_at?: string
          erp_ref?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          country_code?: string
          created_at?: string
          erp_ref?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_brands_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      contact_leads: {
        Row: {
          business_line_id: string | null
          company: string | null
          consent_marketing: boolean
          country_code: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string | null
          locale: string
          message: string | null
          phone: string | null
          sector_id: string | null
          source: string
          source_ref: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          business_line_id?: string | null
          company?: string | null
          consent_marketing?: boolean
          country_code: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name?: string | null
          locale?: string
          message?: string | null
          phone?: string | null
          sector_id?: string | null
          source?: string
          source_ref?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          business_line_id?: string | null
          company?: string | null
          consent_marketing?: boolean
          country_code?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string | null
          locale?: string
          message?: string | null
          phone?: string | null
          sector_id?: string | null
          source?: string
          source_ref?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_leads_business_line_id_fkey"
            columns: ["business_line_id"]
            isOneToOne: false
            referencedRelation: "business_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_leads_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "contact_leads_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string
          currency: string
          default_locale: string
          domain: string | null
          email: string | null
          is_active: boolean
          is_hq: boolean
          name_en: string | null
          name_es: string
          phone: string | null
          sort: number
          timezone: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          code: string
          created_at?: string
          currency: string
          default_locale?: string
          domain?: string | null
          email?: string | null
          is_active?: boolean
          is_hq?: boolean
          name_en?: string | null
          name_es: string
          phone?: string | null
          sort?: number
          timezone: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          default_locale?: string
          domain?: string | null
          email?: string | null
          is_active?: boolean
          is_hq?: boolean
          name_en?: string | null
          name_es?: string
          phone?: string | null
          sort?: number
          timezone?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      country_brands: {
        Row: {
          brand_id: string
          country_code: string
          is_exclusive: boolean
          is_visible: boolean
          sort: number
        }
        Insert: {
          brand_id: string
          country_code: string
          is_exclusive?: boolean
          is_visible?: boolean
          sort?: number
        }
        Update: {
          brand_id?: string
          country_code?: string
          is_exclusive?: boolean
          is_visible?: boolean
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "country_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_brands_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      country_pages: {
        Row: {
          country_code: string
          created_at: string
          hero_extra_en: string | null
          hero_extra_es: string | null
          hero_eyebrow_en: string | null
          hero_eyebrow_es: string | null
          hero_image_media_id: string | null
          hero_intro_en: string | null
          hero_intro_es: string | null
          hero_title_en: string | null
          hero_title_es: string | null
          page_key: string
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          hero_extra_en?: string | null
          hero_extra_es?: string | null
          hero_eyebrow_en?: string | null
          hero_eyebrow_es?: string | null
          hero_image_media_id?: string | null
          hero_intro_en?: string | null
          hero_intro_es?: string | null
          hero_title_en?: string | null
          hero_title_es?: string | null
          page_key: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          hero_extra_en?: string | null
          hero_extra_es?: string | null
          hero_eyebrow_en?: string | null
          hero_eyebrow_es?: string | null
          hero_image_media_id?: string | null
          hero_intro_en?: string | null
          hero_intro_es?: string | null
          hero_title_en?: string | null
          hero_title_es?: string | null
          page_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "country_pages_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "country_pages_hero_image_media_id_fkey"
            columns: ["hero_image_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      country_settings: {
        Row: {
          contact_image_media_id: string | null
          country_code: string
          created_at: string
          hero_eyebrow_en: string | null
          hero_eyebrow_es: string | null
          hero_image_media_id: string | null
          hero_subtitle_en: string | null
          hero_subtitle_es: string | null
          hero_title_en: string | null
          hero_title_es: string | null
          hero_video_media_id: string | null
          seo_description_en: string | null
          seo_description_es: string | null
          seo_title_en: string | null
          seo_title_es: string | null
          updated_at: string
        }
        Insert: {
          contact_image_media_id?: string | null
          country_code: string
          created_at?: string
          hero_eyebrow_en?: string | null
          hero_eyebrow_es?: string | null
          hero_image_media_id?: string | null
          hero_subtitle_en?: string | null
          hero_subtitle_es?: string | null
          hero_title_en?: string | null
          hero_title_es?: string | null
          hero_video_media_id?: string | null
          seo_description_en?: string | null
          seo_description_es?: string | null
          seo_title_en?: string | null
          seo_title_es?: string | null
          updated_at?: string
        }
        Update: {
          contact_image_media_id?: string | null
          country_code?: string
          created_at?: string
          hero_eyebrow_en?: string | null
          hero_eyebrow_es?: string | null
          hero_image_media_id?: string | null
          hero_subtitle_en?: string | null
          hero_subtitle_es?: string | null
          hero_title_en?: string | null
          hero_title_es?: string | null
          hero_video_media_id?: string | null
          seo_description_en?: string | null
          seo_description_es?: string | null
          seo_title_en?: string | null
          seo_title_es?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "country_settings_contact_image_media_id_fkey"
            columns: ["contact_image_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_settings_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: true
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "country_settings_hero_image_media_id_fkey"
            columns: ["hero_image_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_settings_hero_video_media_id_fkey"
            columns: ["hero_video_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      designers: {
        Row: {
          bio_en: string | null
          bio_es: string | null
          birth_year: number | null
          cover_media_id: string | null
          created_at: string
          death_year: number | null
          id: string
          is_active: boolean
          name: string
          nationality_en: string | null
          nationality_es: string | null
          portrait_media_id: string | null
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          bio_en?: string | null
          bio_es?: string | null
          birth_year?: number | null
          cover_media_id?: string | null
          created_at?: string
          death_year?: number | null
          id?: string
          is_active?: boolean
          name: string
          nationality_en?: string | null
          nationality_es?: string | null
          portrait_media_id?: string | null
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          bio_en?: string | null
          bio_es?: string | null
          birth_year?: number | null
          cover_media_id?: string | null
          created_at?: string
          death_year?: number | null
          id?: string
          is_active?: boolean
          name?: string
          nationality_en?: string | null
          nationality_es?: string | null
          portrait_media_id?: string | null
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designers_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designers_portrait_media_id_fkey"
            columns: ["portrait_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      event_agenda_items: {
        Row: {
          created_at: string
          event_id: string
          id: string
          sort: number
          text_en: string | null
          text_es: string
          time_label: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          sort?: number
          text_en?: string | null
          text_es: string
          time_label?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          sort?: number
          text_en?: string | null
          text_es?: string
          time_label?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_agenda_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_brands: {
        Row: {
          brand_id: string
          event_id: string
        }
        Insert: {
          brand_id: string
          event_id: string
        }
        Update: {
          brand_id?: string
          event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_brands_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_designers: {
        Row: {
          designer_id: string
          event_id: string
        }
        Insert: {
          designer_id: string
          event_id: string
        }
        Update: {
          designer_id?: string
          event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_designers_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "designers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_designers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_media: {
        Row: {
          event_id: string
          media_id: string
          sort: number
        }
        Insert: {
          event_id: string
          media_id: string
          sort?: number
        }
        Update: {
          event_id?: string
          media_id?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      event_products: {
        Row: {
          event_id: string
          product_id: string
          sort: number
        }
        Insert: {
          event_id: string
          product_id: string
          sort?: number
        }
        Update: {
          event_id?: string
          product_id?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_products_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_country_catalog"
            referencedColumns: ["product_id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          checked_in_at: string | null
          companions: number
          company: string | null
          consent_marketing: boolean
          consent_privacy: boolean
          created_at: string
          email: string
          event_id: string
          full_name: string
          id: string
          locale: string
          pass_type: string | null
          phone: string | null
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        Insert: {
          checked_in_at?: string | null
          companions?: number
          company?: string | null
          consent_marketing?: boolean
          consent_privacy: boolean
          created_at?: string
          email: string
          event_id: string
          full_name: string
          id?: string
          locale?: string
          pass_type?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Update: {
          checked_in_at?: string | null
          companions?: number
          company?: string | null
          consent_marketing?: boolean
          consent_privacy?: boolean
          created_at?: string
          email?: string
          event_id?: string
          full_name?: string
          id?: string
          locale?: string
          pass_type?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          access_type: Database["public"]["Enums"]["event_access"]
          address: string | null
          body_en: string | null
          body_es: string | null
          capacity: number | null
          city: string | null
          country_code: string
          cover_media_id: string | null
          created_at: string
          ends_at: string | null
          id: string
          is_online: boolean
          online_url: string | null
          registration_closes_at: string | null
          registration_enabled: boolean
          slug: string
          slug_en: string | null
          starts_at: string
          status: Database["public"]["Enums"]["content_status"]
          summary_en: string | null
          summary_es: string | null
          timezone: string
          title_en: string | null
          title_es: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
          venue_name: string | null
        }
        Insert: {
          access_type?: Database["public"]["Enums"]["event_access"]
          address?: string | null
          body_en?: string | null
          body_es?: string | null
          capacity?: number | null
          city?: string | null
          country_code: string
          cover_media_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          is_online?: boolean
          online_url?: string | null
          registration_closes_at?: string | null
          registration_enabled?: boolean
          slug: string
          slug_en?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string | null
          summary_es?: string | null
          timezone: string
          title_en?: string | null
          title_es: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          venue_name?: string | null
        }
        Update: {
          access_type?: Database["public"]["Enums"]["event_access"]
          address?: string | null
          body_en?: string | null
          body_es?: string | null
          capacity?: number | null
          city?: string | null
          country_code?: string
          cover_media_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          is_online?: boolean
          online_url?: string | null
          registration_closes_at?: string | null
          registration_enabled?: boolean
          slug?: string
          slug_en?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string | null
          summary_es?: string | null
          timezone?: string
          title_en?: string | null
          title_es?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "events_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_en: string | null
          alt_es: string | null
          bytes: number | null
          country_code: string | null
          created_at: string
          created_by: string | null
          credit: string | null
          dominant_color: string | null
          height: number | null
          id: string
          is_downloadable: boolean
          kind: Database["public"]["Enums"]["media_kind"]
          lqip: string | null
          mime_type: string | null
          original_bucket: string | null
          original_path: string | null
          processing_status: Database["public"]["Enums"]["media_processing_status"]
          public_paths: Json
          updated_at: string
          width: number | null
        }
        Insert: {
          alt_en?: string | null
          alt_es?: string | null
          bytes?: number | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          credit?: string | null
          dominant_color?: string | null
          height?: number | null
          id?: string
          is_downloadable?: boolean
          kind: Database["public"]["Enums"]["media_kind"]
          lqip?: string | null
          mime_type?: string | null
          original_bucket?: string | null
          original_path?: string | null
          processing_status?: Database["public"]["Enums"]["media_processing_status"]
          public_paths?: Json
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt_en?: string | null
          alt_es?: string | null
          bytes?: number | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          credit?: string | null
          dominant_color?: string | null
          height?: number | null
          id?: string
          is_downloadable?: boolean
          kind?: Database["public"]["Enums"]["media_kind"]
          lqip?: string | null
          mime_type?: string | null
          original_bucket?: string | null
          original_path?: string | null
          processing_status?: Database["public"]["Enums"]["media_processing_status"]
          public_paths?: Json
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "media_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offices: {
        Row: {
          address: string
          city: string
          country_code: string
          created_at: string
          email: string | null
          id: string
          is_main: boolean
          maps_url: string | null
          phone: string | null
          sort: number
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          country_code: string
          created_at?: string
          email?: string | null
          id?: string
          is_main?: boolean
          maps_url?: string | null
          phone?: string | null
          sort?: number
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          country_code?: string
          created_at?: string
          email?: string | null
          id?: string
          is_main?: boolean
          maps_url?: string | null
          phone?: string | null
          sort?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offices_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      product_designers: {
        Row: {
          designer_id: string
          product_id: string
        }
        Insert: {
          designer_id: string
          product_id: string
        }
        Update: {
          designer_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_designers_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "designers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_designers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_designers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_country_catalog"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_media: {
        Row: {
          media_id: string
          product_id: string
          sort: number
        }
        Insert: {
          media_id: string
          product_id: string
          sort?: number
        }
        Update: {
          media_id?: string
          product_id?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_country_catalog"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_sectors: {
        Row: {
          product_id: string
          sector_id: string
        }
        Insert: {
          product_id: string
          sector_id: string
        }
        Update: {
          product_id?: string
          sector_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sectors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sectors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_country_catalog"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_sectors_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          dimensions: Json | null
          erp_ref: string | null
          id: string
          is_active: boolean
          name_en: string | null
          name_es: string
          options: Json
          product_id: string
          sku: string | null
          sort: number
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          dimensions?: Json | null
          erp_ref?: string | null
          id?: string
          is_active?: boolean
          name_en?: string | null
          name_es?: string
          options?: Json
          product_id: string
          sku?: string | null
          sort?: number
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          dimensions?: Json | null
          erp_ref?: string | null
          id?: string
          is_active?: boolean
          name_en?: string | null
          name_es?: string
          options?: Json
          product_id?: string
          sku?: string | null
          sort?: number
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_country_catalog"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          business_line_id: string | null
          catalog_brand_id: string
          country_code: string
          cover_media_id: string | null
          created_at: string
          description_en: string | null
          description_es: string | null
          erp_ref: string | null
          id: string
          is_featured: boolean
          is_purchasable: boolean
          is_visible: boolean
          lead_time_days: number | null
          name_en: string | null
          name_es: string
          slug: string
          slug_en: string | null
          sort: number
          specs: Json
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          business_line_id?: string | null
          catalog_brand_id: string
          country_code: string
          cover_media_id?: string | null
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          erp_ref?: string | null
          id?: string
          is_featured?: boolean
          is_purchasable?: boolean
          is_visible?: boolean
          lead_time_days?: number | null
          name_en?: string | null
          name_es: string
          slug: string
          slug_en?: string | null
          sort?: number
          specs?: Json
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          business_line_id?: string | null
          catalog_brand_id?: string
          country_code?: string
          cover_media_id?: string | null
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          erp_ref?: string | null
          id?: string
          is_featured?: boolean
          is_purchasable?: boolean
          is_visible?: boolean
          lead_time_days?: number | null
          name_en?: string | null
          name_es?: string
          slug?: string
          slug_en?: string | null
          sort?: number
          specs?: Json
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_business_line_id_fkey"
            columns: ["business_line_id"]
            isOneToOne: false
            referencedRelation: "business_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_catalog_brand_id_fkey"
            columns: ["catalog_brand_id"]
            isOneToOne: false
            referencedRelation: "catalog_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "products_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          global_role: Database["public"]["Enums"]["global_role"] | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          global_role?: Database["public"]["Enums"]["global_role"] | null
          id: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          global_role?: Database["public"]["Enums"]["global_role"] | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      project_brands: {
        Row: {
          brand_id: string
          project_id: string
        }
        Insert: {
          brand_id: string
          project_id: string
        }
        Update: {
          brand_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_brands_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_business_lines: {
        Row: {
          business_line_id: string
          project_id: string
        }
        Insert: {
          business_line_id: string
          project_id: string
        }
        Update: {
          business_line_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_business_lines_business_line_id_fkey"
            columns: ["business_line_id"]
            isOneToOne: false
            referencedRelation: "business_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_business_lines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_media: {
        Row: {
          caption_en: string | null
          caption_es: string | null
          media_id: string
          project_id: string
          sort: number
        }
        Insert: {
          caption_en?: string | null
          caption_es?: string | null
          media_id: string
          project_id: string
          sort?: number
        }
        Update: {
          caption_en?: string | null
          caption_es?: string | null
          media_id?: string
          project_id?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          body_en: string | null
          body_es: string | null
          city: string | null
          client_name: string | null
          country_code: string
          cover_media_id: string | null
          created_at: string
          id: string
          is_featured: boolean
          published_at: string | null
          sector_id: string | null
          slug: string
          slug_en: string | null
          sort: number
          status: Database["public"]["Enums"]["content_status"]
          summary_en: string | null
          summary_es: string | null
          title_en: string | null
          title_es: string
          updated_at: string
          year: number | null
        }
        Insert: {
          body_en?: string | null
          body_es?: string | null
          city?: string | null
          client_name?: string | null
          country_code: string
          cover_media_id?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          sector_id?: string | null
          slug: string
          slug_en?: string | null
          sort?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string | null
          summary_es?: string | null
          title_en?: string | null
          title_es: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          body_en?: string | null
          body_es?: string | null
          city?: string | null
          client_name?: string | null
          country_code?: string
          cover_media_id?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          published_at?: string | null
          sector_id?: string | null
          slug?: string
          slug_en?: string | null
          sort?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string | null
          summary_es?: string | null
          title_en?: string | null
          title_es?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "projects_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          cover_media_id: string | null
          created_at: string
          description_en: string | null
          description_es: string | null
          id: string
          name_en: string | null
          name_es: string
          slug: string
          slug_en: string | null
          sort: number
          updated_at: string
        }
        Insert: {
          cover_media_id?: string | null
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          id?: string
          name_en?: string | null
          name_es: string
          slug: string
          slug_en?: string | null
          sort?: number
          updated_at?: string
        }
        Update: {
          cover_media_id?: string | null
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          id?: string
          name_en?: string | null
          name_es?: string
          slug?: string
          slug_en?: string | null
          sort?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sectors_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          stats: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          stats?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          stats?: Json
          updated_at?: string
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          country_code: string
          created_at: string
          handle: string | null
          id: string
          is_active: boolean
          platform: Database["public"]["Enums"]["social_platform"]
          sort: number
          updated_at: string
          url: string
        }
        Insert: {
          country_code: string
          created_at?: string
          handle?: string | null
          id?: string
          is_active?: boolean
          platform: Database["public"]["Enums"]["social_platform"]
          sort?: number
          updated_at?: string
          url: string
        }
        Update: {
          country_code?: string
          created_at?: string
          handle?: string | null
          id?: string
          is_active?: boolean
          platform?: Database["public"]["Enums"]["social_platform"]
          sort?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      team_members: {
        Row: {
          country_code: string
          created_at: string
          full_name: string
          id: string
          is_published: boolean
          linkedin_url: string | null
          photo_media_id: string | null
          photo_position: string | null
          role_en: string | null
          role_es: string
          sort: number
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          full_name: string
          id?: string
          is_published?: boolean
          linkedin_url?: string | null
          photo_media_id?: string | null
          photo_position?: string | null
          role_en?: string | null
          role_es: string
          sort?: number
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          full_name?: string
          id?: string
          is_published?: boolean
          linkedin_url?: string | null
          photo_media_id?: string | null
          photo_position?: string | null
          role_en?: string | null
          role_es?: string
          sort?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "team_members_photo_media_id_fkey"
            columns: ["photo_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_country_roles: {
        Row: {
          country_code: string
          created_at: string
          role: Database["public"]["Enums"]["country_role"]
          user_id: string
        }
        Insert: {
          country_code: string
          created_at?: string
          role: Database["public"]["Enums"]["country_role"]
          user_id: string
        }
        Update: {
          country_code?: string
          created_at?: string
          role?: Database["public"]["Enums"]["country_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_country_roles_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "user_country_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      variant_prices: {
        Row: {
          cost: number | null
          currency: string
          price: number | null
          updated_at: string
          variant_id: string
        }
        Insert: {
          cost?: number | null
          currency: string
          price?: number | null
          updated_at?: string
          variant_id: string
        }
        Update: {
          cost?: number | null
          currency?: string
          price?: number | null
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_prices_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_prices_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "v_country_catalog"
            referencedColumns: ["variant_id"]
          },
        ]
      }
    }
    Views: {
      v_country_catalog: {
        Row: {
          amount: number | null
          brand_id: string | null
          business_line_id: string | null
          catalog_brand_id: string | null
          catalog_brand_name: string | null
          country_code: string | null
          cover_media_id: string | null
          currency: string | null
          is_featured: boolean | null
          is_purchasable: boolean | null
          is_visible: boolean | null
          lead_time_days: number | null
          name_en: string | null
          name_es: string | null
          options: Json | null
          product_id: string | null
          sku: string | null
          slug: string | null
          slug_en: string | null
          sort: number | null
          status: Database["public"]["Enums"]["content_status"] | null
          variant_id: string | null
          variant_name_en: string | null
          variant_name_es: string | null
          variant_sort: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_business_line_id_fkey"
            columns: ["business_line_id"]
            isOneToOne: false
            referencedRelation: "business_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_catalog_brand_id_fkey"
            columns: ["catalog_brand_id"]
            isOneToOne: false
            referencedRelation: "catalog_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "products_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_public_price: {
        Args: { p_variant_id: string }
        Returns: {
          amount: number
          currency: string
        }[]
      }
      register_for_event: {
        Args: {
          p_companions: number
          p_company: string
          p_consent_marketing: boolean
          p_email: string
          p_event_id: string
          p_full_name: string
          p_locale: string
          p_pass_type: string
          p_phone: string
        }
        Returns: {
          registration_id: string
          registration_status: Database["public"]["Enums"]["registration_status"]
        }[]
      }
    }
    Enums: {
      content_status: "draft" | "published" | "archived"
      country_role: "viewer" | "editor" | "admin"
      event_access: "open" | "registration_required" | "invite_only"
      event_type:
        | "event"
        | "launch"
        | "fair"
        | "webinar"
        | "lunch_and_learn"
        | "workshop"
        | "showroom"
      global_role: "super_admin" | "catalog_admin"
      lead_status: "new" | "contacted" | "qualified" | "closed"
      media_kind:
        | "project_photo"
        | "product_photo"
        | "event_photo"
        | "brand_logo"
        | "team_photo"
        | "hero"
        | "generic"
        | "designer_photo"
      media_processing_status: "pending" | "ready" | "failed"
      registration_status:
        | "pending"
        | "confirmed"
        | "waitlist"
        | "cancelled"
        | "attended"
      social_platform:
        | "instagram"
        | "facebook"
        | "linkedin"
        | "youtube"
        | "tiktok"
        | "pinterest"
        | "x"
        | "whatsapp"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_status: ["draft", "published", "archived"],
      country_role: ["viewer", "editor", "admin"],
      event_access: ["open", "registration_required", "invite_only"],
      event_type: [
        "event",
        "launch",
        "fair",
        "webinar",
        "lunch_and_learn",
        "workshop",
        "showroom",
      ],
      global_role: ["super_admin", "catalog_admin"],
      lead_status: ["new", "contacted", "qualified", "closed"],
      media_kind: [
        "project_photo",
        "product_photo",
        "event_photo",
        "brand_logo",
        "team_photo",
        "hero",
        "generic",
        "designer_photo",
      ],
      media_processing_status: ["pending", "ready", "failed"],
      registration_status: [
        "pending",
        "confirmed",
        "waitlist",
        "cancelled",
        "attended",
      ],
      social_platform: [
        "instagram",
        "facebook",
        "linkedin",
        "youtube",
        "tiktok",
        "pinterest",
        "x",
        "whatsapp",
      ],
    },
  },
} as const
