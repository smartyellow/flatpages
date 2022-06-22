'use strict';

const icons = {
  page: '<path d="M655.754 280.617H490.34c-38.402 0-62.031-23.633-62.031-62.031V53.168c0-13.293-10.34-23.629-23.633-23.629H159.508c-38.399 0-70.89 32.492-70.89 70.89V667.57c0 38.399 32.491 70.89 70.89 70.89h448.984c38.399 0 70.89-32.491 70.89-70.89V304.246c0-13.293-10.335-23.629-23.628-23.629Zm0 0"/><path d="M674.953 190.523 518.398 33.97c-2.953-2.953-8.859-4.43-13.289-4.43-8.863 0-17.726 7.383-17.726 16.246v125.54c0 26.581 23.633 50.214 50.219 50.214h125.535c8.863 0 16.246-8.863 16.246-17.723 0-4.433-1.477-10.34-4.43-13.293Zm0 0"/>',
};

module.exports = {

  // Friendly name
  name: 'Flatpages',

  // Brief description of this plugin
  purpose: 'Create "flatpages" consisting of rich text',

  // Version of this plugin
  version: '1.0.0',

  // Name of the plugin author
  author: 'Romein van Buren',

  // Name of vendor of this plugin
  vendor: 'Smart Yellow',

  // Array of plugins this plugin depends on
  requires: [ 'webdesq/sessions', 'webdesq/storage' ],

  // Features this plugin offers
  features: {
    seeMyFlatpages: {
      description: 'See my flatpages',
    },
    seeAllFlatpages: {
      description: 'See all flatpages',
    },
    editFlatpages: {
      description: 'Edit flatpages',
      requires: [ [ 'seeMyFlatpages', 'seeAllFlatpages' ] ],
    },
    createFlatpages: {
      description: 'Create flatpages',
      requires: 'editFlatpages',
    },
    deleteFlatpages: {
      description: 'Delete flatpages',
      requires: 'createFlatpages',
    },
  },

  settings: {
    preview: {
      type: 'string',
      label: 'preview url',
      default: '',
    },
    channels: {
      type: 'keys',
      label: 'channels',
      default: {},
    },
  },

  icon: icons.page,

  entities: {
    flatpage: 'flatpage.js',
  },

  gui: {
    modules: () => [
      { path: 'flatpages.svelte',
        requires: [ 'seeMyFlatpages', 'seeAllFlatpages' ],
        menu: {
          cluster: 'content',
          icon: icons.page,
          title: 'all flatpages',
        },
      },
    ],
  },

  routes: ({ server, settings }) => [

    // Get all flatpages I'm allowed to see
    { route: '/flatpages',
      method: 'get',
      requires: [ 'smartyellow/flatpages/seeMyFlatpages', 'smartyellow/flatpages/seeAllFlatpages' ],
      handler: async (req, res, user) => {
        const q = server.storage({ user }).store('flatpages').find().sort({ 'log.created.on': -1 });
        const result = await (req.headers['format'] == 'object' ? q.toObject() : q.toArray());
        res.json(result);
      },
    },

    { route: '/flatpages/settings',
      method: 'get',
      purpose: 'Receive all predefined settings for flatpages',
      requires: [ 'smartyellow/flatpages/seeMyFlatpages', 'smartyellow/flatpages/seeAllFlatpages' ],
      handler: async (req, res) => {
        res.json({
          previewUrl: settings.preview,
        });
      },
    },

    // Get specific flatpage
    { route: '/flatpages/:id',
      method: 'get',
      requires: [ 'smartyellow/flatpages/seeMyFlatpages', 'smartyellow/flatpages/seeAllFlatpages' ],
      handler: async (req, res, user) => {
        const doc = await server.storage({ user }).store('smartyellow/flatpage').get(req.params[0]);
        if (!doc) {
          res.error(404);
          return;
        }
        if (user.cannot('smartyellow/flatpages/seeAllFlatpages')) {
          const set = [ user.id, ...(user.coworkers || []) ];
          if (!set.includes(doc.log.created.by)) {
            // no access to this flatpage, send 'not authorized' error
            res.error(401);
            return;
          }
        }
        // validate item
        const result = await server.validateEntity({
          entity: 'smartyellow/flatpage',
          id: req.params[0],
          data: doc,
          validateOnly: true,
          user: user,
          isNew: false,
        });
        res.json(result);
      },
    },

    // Create new flatpage
    { route: '/flatpages',
      method: 'post',
      requires: 'smartyellow/flatpages/createFlatpages',
      handler: async (req, res, user) => {

        let result = await server.validateEntity({
          validateOnly: req.headers['init'],
          isNew: true,
          entity: 'smartyellow/flatpage',
          user: user,
          data: req.body,
        });

        // If validation was OK and we're not in initMode, store the new values
        if (result.store) {
          result = await result.store();
          delete result.store;
          // broadcast reload trigger
          server.publish('cms', 'smartyellow/flatpages/reload');
        }

        res.json(result);
      },
    },

    // Update existing flatpage
    { route: '/flatpages/:id',
      method: 'put',
      requires: 'smartyellow/flatpages/editFlatpages',
      handler: async (req, res, user) => {

        const result = await server.validateEntity({
          entity: 'smartyellow/flatpage',
          id: req.params[0],
          data: req.body,
          isNew: false,
          storeIfValid: true,
          validateOnly: req.headers['init'],
          user: user,
        });

        if (!result.errors) {
          // broadcast reload trigger
          server.publish('cms', 'smartyellow/flatpages/reload');
        }

        res.json(result);
      },
    },

    // Delete specific flatpage
    { route: '/flatpages/:id',
      method: 'delete',
      requires: 'smartyellow/flatpages/deleteFlatpages',
      handler: async (req, res, user) => {
        // Check if user is allowed to see flatpage to be deleted
        const flatpages = await server.storage({ user }).store('flatpages').find().toObject();
        if (flatpages[req.params[0]]) {
          // User is allowed to see the flatpage to be deleted, continue
          await server.storage({ user }).store('flatpages').delete({ id: req.params[0] });
          // broadcast reload trigger
          server.publish('cms', 'smartyellow/flatpages/reload');
        }
        else {
          // Not authorized
          res.error(401);
        }
      },
    },

    { route: '/flatpages/filters',
      method: 'get',
      requires: [ 'smartyellow/flatpages/seeMyFlatpages', 'smartyellow/flatpages/seeAllFlatpages' ],
      handler: async (req, res, user) => {
        const filters = await server.getFilters({
          entity: 'smartyellow/flatpage',
          user: user,
        });
        res.json(filters);
      },
    },

    { route: '/flatpages/formats',
      method: 'get',
      purpose: 'Get columns defined for entity smartyellow/flatpage',
      handler: async (req, res, user) => {
        const formats = await server.getFormats({
          entity: 'smartyellow/flatpage',
          user: user,
        });
        res.json(formats);
      },
    },

    { route: '/flatpages/search',
      method: 'post',
      requires: [ 'smartyellow/flatpages/seeMyFlatpages', 'smartyellow/flatpages/seeAllFlatpages' ],
      handler: async (req, res, user) => {
        // Get query and language from posted data
        const { query } = req.body;
        const filters = await server.getFilters({
          entity: 'smartyellow/flatpage',
          user: user,
        });
        const storageQuery = server.storage({ user }).prepareQuery(filters, query, req.body.languages || false);
        const find = server.storage({ user }).store('flatpages').find(storageQuery);
        const result = await (req.headers['format'] == 'object' ? find.toObject() : find.toArray());
        res.json(result);
      },
    },

  ],

};
