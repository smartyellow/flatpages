'use strict';

const { makeId } = require('core/makeid');
const generateSlug = require('core/generateslug');

const states = {
  concept: 'concept',
  waitingforapproval: 'waiting for approval',
  online: 'online',
  archived: 'archived',
  offline: 'offline',
};

module.exports = {
  format: 5,
  author: 'Romein van Buren',
  vendor: 'Smart Yellow',
  purpose: 'Definition of a flatpage',
  store: 'flatpages',
  forms: ({ globals, settings }) => ({
    default: {
      pages: [
        { label: 'meta',
          sections: [
            'id',
            'name',
            'slug',
            'status',
            'channels',
            'author',
            'pubdate',
            'personas',
          ],
        },
        { label: 'content',
          sections: [
            'summary',
            'content',
          ],
        },
        { label: 'media',
          sections: [
            'visual',
            'logos',
            'video',
          ],
        },
        { label: 'SEO',
          sections: [
            'seo',
            'cta',
          ],
        },
      ],
      sections: {
        id: {
          label: 'id',
          fields: [
            { key: 'id',
              editor: 'string',
              readonly: true,
            },
          ],
        },
        name: {
          label: 'name',
          fields: [
            { key: 'name',
              editor: 'string',
              localized: true,
              placeholder: 'Enter the name of the flatpage',
            },
          ],
        },
        slug: {
          label: 'slug',
          fields: [
            { key: 'slug',
              editor: 'string',
              localized: true,
              placeholder: 'Create the slug of the flatpage',
            },
          ],
        },
        status: {
          label: 'status',
          fields: [
            { key: 'status',
              editor: 'select',
              required: true,
              options: states,
            },
          ],
        },
        channels: {
          label: 'channels',
          fields: [
            { key: 'channels',
              editor: 'multiselect',
              placeholder: 'enter channels...',
              visible: !!(settings.channels && Object.keys(settings.channels).length),
              options: settings.channels,
            },
          ],
        },
        author: {
          label: 'author',
          fields: [
            { key: 'author.inherit',
              editor: 'checkbox',
              label: 'identical to creator of this flatpage',
            },
            { key: 'author.name',
              editor: 'string',
              condition: {
                key: 'author.inherit',
                value: false,
              },
            },
          ],
        },
        pubdate: {
          label: 'date published',
          fields: [
            { key: 'pubdate',
              editor: 'date',
            },
          ],
        },
        personas: {
          label: 'personas',
          fields: [
            { key: 'personas',
              editor: 'multiselect',
              placeholder: 'Add one or more personas',
              options: globals.personas,
              visible: ({ globals }) => globals.personas && Object.keys(globals.personas).length,
              custom: false,
            },
          ],
        },
        summary: {
          label: 'summary',
          fields: [
            { key: 'summary',
              editor: 'string',
              localized: true,
              placeholder: 'Enter a short summary of your flatpage (tagline, ~1 sentence)',
            },
          ],
        },
        content: {
          label: 'content',
          fields: [
            { key: 'content',
              editor: 'text',
              localized: true,
              markup: true,
              placeholder: 'Enter a long-form flatpage body (can be multiple paragraphs)',
            },
          ],
        },
        visual: {
          label: 'visual',
          fields: [
            { key: 'visual',
              editor: 'file',
              min: 0,
              max: 1,
              accept: [ 'image/*' ],
            },
          ],
        },
        logos: {
          label: 'client logos',
          fields: [
            { key: 'logos',
              editor: 'file',
              min: 0,
              max: 5,
              accept: [ 'image/*' ],
            },
          ],
        },
        video: {
          label: 'video',
          fields: [
            { key: 'video',
              editor: 'video',
            },
          ],
        },
        cta: {
          label: 'Call-to-action',
          fields: [
            { key: 'cta.enabled',
              editor: 'checkbox',
              label: 'Add a call-to-action box at the end of the page',
            },
            { key: 'cta.title',
              editor: 'string',
              label: 'CTA title',
              placeholder: 'Title for the CTA box',
              localized: true,
              condition: {
                key: 'cta.enabled',
                value: true,
              },
            },
            { key: 'cta.tagline',
              editor: 'string',
              label: 'CTA tagline',
              placeholder: 'Tagline displayed beneath the CTA title',
              localized: true,
              condition: {
                key: 'cta.enabled',
                value: true,
              },
            },
            { key: 'cta.button.label',
              editor: 'string',
              label: 'Button label',
              placeholder: 'Label of the button',
              localized: true,
              condition: {
                key: 'cta.enabled',
                value: true,
              },
            },
            { key: 'cta.button.url',
              editor: 'link',
              label: 'Button URL',
              placeholder: 'URL the button points to',
              localized: true,
              condition: {
                key: 'cta.enabled',
                value: true,
              },
            },
            { key: 'cta.visual',
              editor: 'file',
              label: 'CTA visual',
              min: 0,
              max: 1,
              accept: [ 'image/*' ],
              condition: {
                key: 'cta.enabled',
                value: true,
              },
            },
          ],
        },
        seo: {
          label: 'SEO related',
          fields: [
            { key: 'seo.enabled',
              editor: 'checkbox',
              label: 'Configure SEO settings manually',
            },
            { key: 'seo.nofollow',
              editor: 'checkbox',
              condition: {
                key: 'seo.enabled',
                value: true,
              },
              label: 'Use "no follow" to prevent search engine',
            },
            { key: 'seo.noindex',
              editor: 'checkbox',
              condition: {
                key: 'seo.enabled',
                value: true,
              },
              label: 'Use "no index"',
            },
            { key: 'seo.title',
              editor: 'string',
              localized: true,
              condition: {
                key: 'seo.enabled',
                value: true,
              },
              placeholder: 'Enter optimized title',
              label: 'SEO title',
            },
            { key: 'seo.description',
              editor: 'string',
              localized: true,
              condition: {
                key: 'seo.enabled',
                value: true,
              },
              placeholder: 'Enter optimized description',
              label: 'SEO description',
            },
            { key: 'seo.canonical',
              editor: 'string',
              localized: true,
              condition: {
                key: 'seo.enabled',
                value: true,
              },
              placeholder: 'Enter canonical URL',
              label: 'Canonical URL',
            },
          ],
        },
      },
    },
  }),
  schema: ({ settings }) => ({
    id: {
      type: 'string',
      required: ({ newEntity }) => newEntity,
      lowercase: true,
      trim: true,
      filter: {
        title: 'id',
        match: '^[a-zA-Z0-9]{6}',
        order: 999,
      },
      //match: [ types.objectid, 'invalid id' ],
      validate: async ({ newValues, oldValues, newEntity, storage }) => {
        if (newEntity) {
          // For new records, any value is ok
          const r = storage ? await storage.store('smartyellow/flatpage').get(newValues.id) : null;
          return (r == null ? true : 'id already exists');
        }
        else {
          // ID cannot be changed if record was already created
          return (newValues.id == oldValues.id ? true : 'id cannot be changed');
        }
      },
      default: () => makeId(6),
    },
    name: {
      type: 'stringset',
      default: '',
      trim: true,
      required: [ true, 'The flatpage title is required.' ],
      filter: {
        title: 'name',
        match: '^[a-z]',
        localized: true,
      },
      format: {
        label: 'name',
        type: 'text',
        sortable: 'text',
        sticky: true,
        sorted: 'up',
        align: 'left',
        minWidth: 300,
        enabled: true,
        priority: 1,
      },
    },
    slug: {
      type: 'stringset',
      default: '',
      onDataValid: async ({ newValues, oldValues, newEntity, storage }) => {
        const store = storage.store('smartyellow/flatpage');
        await generateSlug({
          store: store,
          values: newValues,
          slugFromKey: 'name',
          isNew: newEntity,
          isStringset: true,
          slugKey: 'slug',
          oldSlugsKey: 'oldSlugs',
          isOnline: [ 'waitingforapproval', 'online', 'archived' ].includes(oldValues.state),
        });
      },
    },
    channels: {
      type: 'array',
      of: 'string',
      default: () => {
        const keys = settings.channels ? Object.keys(settings.channels) : [];
        if (keys.length == 1) {
          return [ keys[0] ];
        }
        else {
          return [];
        }
      },
      filter: {
        title: 'channel',
        match: settings.channels && Object.keys(settings.channels).length ? '^[' + Object.keys(settings.channels).join('|') + ']' : null,
      },
      validate: async ({ newValues }) => (newValues.channels.every(key => !!settings.channels[key]) ? true : 'One or more invalid channels'),
      format: {
        label: 'channels',
        type: 'text',
        sortable: 'text',
        minWidth: 80,
        enabled: true,
      },
    },
    oldslugs: {
      type: 'object',
    },
    pubdate: {
      type: 'date',
      required: true,
      default: new Date(),
    },
    status: {
      type: 'string',
      default: 'concept',
      format: {
        label: 'state',
        type: 'state',
        align: 'left',
        sortable: 'text',
        sorted: 'down',
        minWidth: 90,
        enabled: true,
        options: {
          concept: {
            name: 'concept',
            class: 'l2',
          },
          waitingforapproval: {
            name: 'waiting for approval',
            class: 'l3',
          },
          online: {
            name: 'online',
            class: 'l4',
          },
          archived: {
            name: 'archived',
            class: 'l5',
          },
          offline: {
            name: 'offline',
            class: 'l1',
          },
        },
      },
    },
    author: {
      inherit: {
        type: 'boolean',
        default: true,
      },
      name: {
        type: 'string',
        default: '',
        filter: {
          title: 'author',
          match: '^[a-zA-Z0-9]*',
        },
      },
    },
    summary: {
      type: 'stringset',
      default: '',
      format: {
        label: 'summary',
        type: 'text',
        sortable: 'text',
        minWidth: 150,
        enabled: true,
        priority: 6,
      },
    },
    content: {
      type: 'stringset',
      skip: true,
      default: '',
    },
    personas: {
      type: 'array',
      of: 'string',
      default: [],
    },
    seo: {
      enabled: {
        type: 'boolean',
        default: false,
      },
      noindex: {
        type: 'boolean',
        default: false,
      },
      nofollow: {
        type: 'boolean',
        default: false,
      },
      canonical: {
        type: 'stringset',
      },
      title: {
        type: 'stringset',
      },
      description: {
        type: 'stringset',
      },
    },
    video: {
      type: 'array',
      of: {
        id: {
          type: 'string',
        },
        host: {
          type: 'string',
        },
        thumb: {
          type: 'string',
        },
      },
      default: [],
    },
    visual: {
      type: 'array',
      of: [ 'string' ],
      default: [],
      skip: true,
      onDataValid: async ({ newValues, storage, user }) => {
        newValues.visual = newValues.visual || [];
        if (!Array.isArray(newValues.visual)) {
          newValues.visual = [ newValues.visual ];
        }
        for (let i = 0; i < newValues.visual.length; i++) {
          if (newValues.visual[i].data) {
            //
            if (storage) {
              // If storage is available, insert the new file into storage and collect id
              const result = await storage({ user }).bucket('webdesq/media').insert({
                id: makeId(6),
                filename: newValues.visual[i].name,
                metadata: {
                  contentType: newValues.visual[i].type,
                },
              }, newValues.visual[i].data)
                .catch(error => {
                  if (error.code !== 'DUPLICATE_FILE') {
                    throw error;
                  }
                  newValues.visual[i] = error.file.id;
                });
              if (result) {
                newValues.visual[i] = result.id;
              }
            }
            else {
              // If no storage is available, remove slot by setting it to null
              newValues.visual[i] = null;
            }
          }
          // remove empty slots in pictures array
          newValues.visual = newValues.visual.filter(i => i != null);
          newValues.visual = [ ...new Set(newValues.visual) ];
        }
      },
    },
    images: {
      type: 'array',
      of: [ 'string' ],
      default: [],
      skip: true,
      onDataValid: async ({ newValues, storage, user }) => {
        newValues.images = newValues.images || [];
        for (let i = 0; i < newValues.images.length; i++) {
          if (newValues.images[i].data) {
            if (storage) {
              // If storage is available, insert the new file into storage and collect id
              const result = await storage({ user }).bucket('webdesq/media').insert({
                id: makeId(6),
                filename: newValues.images[i].name,
                metadata: {
                  contentType: newValues.images[i].type,
                },
              }, newValues.images[i].data)
                .catch(error => {
                  if (error.code !== 'DUPLICATE_FILE') {
                    throw error;
                  }
                  newValues.images[i] = error.file.id;
                });
              if (result) {
                newValues.images[i] = result.id;
              }
            }
            else {
              // If no storage is available, remove slot by setting it to null
              newValues.images[i] = null;
            }
          }
          // remove empty slots in photo array
          newValues.images = newValues.images.filter(i => i != null);
          newValues.images = [ ...new Set(newValues.images) ];
        }
      },
    },
    cta: {
      visual: {
        type: 'array',
        of: [ 'string' ],
        default: [],
        skip: true,
        onDataValid: async ({ newValues, storage, user }) => {
          newValues.cta.visual = newValues.cta.visual || [];
          if (!Array.isArray(newValues.cta.visual)) {
            newValues.cta.visual = [ newValues.cta.visual ];
          }
          for (let i = 0; i < newValues.cta.visual.length; i++) {
            if (newValues.cta.visual[i].data) {
              //
              if (storage) {
                // If storage is available, insert the new file into storage and collect id
                const result = await storage({ user }).bucket('webdesq/media').insert({
                  id: makeId(6),
                  filename: newValues.cta.visual[i].name,
                  metadata: {
                    contentType: newValues.cta.visual[i].type,
                  },
                }, newValues.cta.visual[i].data)
                  .catch(error => {
                    if (error.code !== 'DUPLICATE_FILE') {
                      throw error;
                    }
                    newValues.cta.visual[i] = error.file.id;
                  });
                if (result) {
                  newValues.cta.visual[i] = result.id;
                }
              }
              else {
                // If no storage is available, remove slot by setting it to null
                newValues.cta.visual[i] = null;
              }
            }
            // remove empty slots in pictures array
            newValues.cta.visual = newValues.cta.visual.filter(i => i != null);
            newValues.cta.visual = [ ...new Set(newValues.cta.visual) ];
          }
        },
      },
    },
  }),
};
