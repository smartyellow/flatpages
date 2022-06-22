<script>

import { createEventDispatcher, onMount, getContext } from 'svelte';
import { user, users, prefix, translate, api } from 'helpers/webdesq/stores.js';
import shareQuery from 'helpers/webdesq/sharequery.js';

// import regular components
import PanelManager from 'components/webdesq/panelmanager.svelte';
import Panel from 'components/webdesq/panel.svelte';
import Toolbar from 'components/webdesq/toolbar.svelte';
import ToolbarButton from 'components/webdesq/toolbarbutton.svelte';
import SaveOrDiscard from 'components/webdesq/saveordiscard.svelte';
import Multifilter from 'components/webdesq/multifilter.svelte';
import Grid from 'components/webdesq/grid.svelte';
import Form from 'components/webdesq/form.svelte';
import ObjectTree from 'components/webdesq/objecttree.svelte';
import EditHistory from 'components/webdesq/edithistory.svelte';
import CompareVersions from 'components/webdesq/compareversions.svelte';

// props
export let focused = false;
export let language = 'en';
export let icon = false;
export let id = false;
export let modified = false;
export let notifications = false;

// local state
const dispatch = createEventDispatcher();
const confirm = getContext('confirm');
const entity = 'smartyellow/flatpage';
const moduleName = 'smartyellow/flatpages';
const readonly = user.cannot(moduleName + '/editFlatpages');

const icons = {
  trash: '<path d="M638 77H501V25c0-14-11-25-25-25H292c-14 0-25 11-25 25v52H130c-14 0-25 11-25 25v77c0 14 11 25 25 25h508c14 0 25-11 25-25v-77c0-14-11-25-25-25zm-187 0H317V50h134zm0 0M140 254l21 490c0 13 11 24 25 24h396c14 0 25-11 25-24l21-490zm168 412a25 25 0 01-50 0V356a25 25 0 0150 0zm101 0a25 25 0 11-50 0V356a25 25 0 0150 0zm101 0a25 25 0 01-50 0V356a25 25 0 0150 0zm0 0"/>',
  history: '<path d="M402 238v183l157 92 26-44-128-76V238zm0 0"/><path d="M439 55a329 329 0 00-329 329H0l142 142 3 6 148-148H183a256 256 0 1175 181l-52 52A329 329 0 10438 55zm0 0"/>',
  wrench: '<path d="M175 631c0-15-13-28-29-28s-29 13-29 28 13 27 29 27 29-12 29-27zm294-180L158 743a61 61 0 0 1-41 16c-16 0-31-6-42-16l-48-46a52 52 0 0 1 0-78l310-292c24 57 72 102 132 124zm289-187c0 15-6 32-11 46a206 206 0 0 1-192 129c-113 0-205-86-205-192S442 55 555 55c33 0 76 9 104 27 5 3 7 7 7 12s-3 9-7 12l-134 72v96l88 46c15-8 121-71 130-71s15 7 15 15zm0 0"/>',
  preview: '<path d="m45 631 158-135c-35-49-55-110-55-174 0-167 133-301 295-301 164 0 296 134 296 301 0 166-132 301-296 301-63 0-122-21-170-56L140 728l-9 8a66 66 0 0 1-94-8 69 69 0 0 1 8-97Zm623-309c0-127-101-229-225-229a227 227 0 0 0-224 229c0 126 100 229 224 229s225-104 225-229Zm0 0"/><path d="M281 294c33-30 94-75 162-75 69 0 130 44 163 75 17 15 17 41 0 56-33 30-94 75-163 75-68 0-129-44-162-75a39 39 0 0 1 0-56Zm162 94c37 0 65-30 65-66s-29-66-65-66c-35 0-65 30-65 66s29 66 65 66Zm0 0"/><path d="M409 322c0 19 16 34 34 34 19 0 34-15 34-34s-15-35-34-35c-18 0-34 16-34 35" />',
  lexicon: '<path d="M685 313H396c-46 0-83 37-83 83v157l-75 54a22 22 0 000 36l76 54c6 40 41 71 82 71h289c46 0 83-37 83-83V396c0-46-37-83-83-83zm-97 316c-5 0-9-1-11-6l-9-32h-55l-9 32c-1 5-5 6-11 6-8 0-19-5-19-13v-2l47-152c2-7 11-10 20-10s18 3 20 10l46 152 1 2c0 8-12 13-20 13zm0 0"/><path d="M520 567h42l-21-74zm0 0M268 396c0-30 11-58 28-80-25 0-49-8-69-22-19 14-43 22-69 22a13 13 0 010-25c18 0 35-5 49-14-17-19-28-43-31-70h-18a13 13 0 110-25h57v-31a13 13 0 1125 0v31h56a13 13 0 110 25h-17c-3 27-14 51-32 70 15 9 32 14 49 14 7 0 13 5 13 12 23-22 54-35 87-35h59v-53l75-54a22 22 0 000-36l-76-54c-6-40-41-71-82-71H83C37 0 0 37 0 83v289c0 46 37 83 83 83h185zm0 0"/><path d="M227 261c14-14 24-33 26-54h-52c3 21 12 40 26 54zm0 0"/>',
};

const gridOptions = {
  icons,
  index: true,
  storageKey: moduleName,
  multiselect: true,
  header: true,
  footer: false,
  rowselect: true,
};

let mounted = false;
let item, backup = false;
let isNew = id === true;
let dragdata = false;
let form;
let log;
let settings = {};
let filters = {};
let items = [];
let errors = {};
let grid;
let savebar;
let multifilter;
let debug = false;
let history = false;
let preview = false;
let selectedVersions = false;


onMount(async function () {
  try {
    if (id) {
      // get settings, to read previewUrl
      settings = await api.get('/flatpages/settings');
      // get item, form and log for specified id
      ({ item, form, log } = isNew ? await api.post('/flatpages', {}, { init: true }) : await api.get('/flatpages/' + id));
      // if existing item, set tabtitle to title of item
      if (!isNew) {
        dispatch('tabchanged', { title: item.name });
      }
    }
    else {
      filters = await api.get('/flatpages/filters');
      gridOptions.columns = await api.get('/flatpages/formats');
      // subscribe to 'news reload' message
      api.subscribe(moduleName + '/reload', async () => {
        multifilter.submit();
      });
    }
    mounted = true;
  }
  catch (e) {
    console.log('Failed to fetch flatpage items', e);
  }
});

function openItem(event, newItem = false) {
  dispatch('openitem', {
    type: moduleName,
    title: newItem ? 'new flatpage' : '',
    icon: icon,
    closeable: true,
    isNew: newItem,
    data: {
      id: event.detail.id,
    },
  });
}

async function saveChanges() {
  if (focused) {
    // save changes for flatpage in form
    savebar.start();
    const result = isNew ?
      await api.post('/flatpages', item) :
      await api.put('/flatpages/' + item.id, item);
    savebar.stop(result);
    if (!result.errors) {
      log = result.log;
      // Once saved, we need to use PUT request to update newly created flatpage
      isNew = false;
      // Update tab title
      dispatch('tabchanged', { title: item.name });
    }
  }
}

async function submitFilters({ detail }) {
  if (grid) {
    grid.reset();
  }
  items = await api.post('/flatpages/search', detail);
}

async function deleteItem() {
  if (item && item.id) {
    try {
      await confirm({
        msg: translate('Are you sure you want to delete this item?', language),
      });
      dispatch('close');
      await api.delete('/flatpages/' + item.id);
    }
    catch (e) {
      console.log(e);
    }
  }
}

function previewItem() {
  if (preview) {
    preview = false;
  }
  else {
    let p = settings.previewUrl;
    p = p.replace(':slug', (item.slug[language] ? item.slug[language] : item.slug.nl));
    preview = {
      url: p,
    };
  }
}

</script>


{#if mounted}

  {#if item}

    <Toolbar large="768" fill="true">
      {#if user.can(moduleName + '/editFlatpages')}
        <SaveOrDiscard {language} {translate} {notifications} bind:errors bind:modified bind:item bind:backup bind:this={savebar} on:save={saveChanges} />
      {/if}
      {#if log && log.created && settings && settings.previewUrl}
        <ToolbarButton title="{translate('preview', language)}" icon={icons.preview} hint="{translate('preview', language)}" submenu>
          <li class:checked="{preview}" on:click="{previewItem}">Page preview</li>
          <li on:click="{() => window.open((settings.previewUrl.split('/')[3]))}">Website preview</li>
        </ToolbarButton>
      {/if}
      {#if form && form.languages}
        <ToolbarButton icon={icons.lexicon} submenu title="{translate('language', language)}">
          {#each form.languages as l}
            <li
              class:checked={l.enabled}
              on:click={() => (l.enabled = !l.enabled)}>
              {l.name}
            </li>
          {/each}
        </ToolbarButton>
      {/if}
      {#if log && log.created}
        <ToolbarButton icon={icons.history} bind:value={history} hint="History" title="{translate('history', language)}" />
      {/if}
      {#if log && log.created && user.can(moduleName + '/deleteFlatpages')}
        <ToolbarButton icon={icons.trash} on:click={deleteItem} hint="Delete" title="{translate('delete', language)}" />
      {/if}
      {#if user.is('sysadmin')}
        <ToolbarButton icon={icons.wrench} bind:value={debug} hint="Show debugger" title="{translate('debug', language)}" />
      {/if}
    </Toolbar>

    <PanelManager>
      <Panel>
        <Form bind:data={item} prefix={$prefix} {api} {form} {readonly} {modified} {language} {translate} {errors} {debug} {notifications} on:save={saveChanges} />
      </Panel>
      {#if preview}
        <Panel width="50%">
          <iframe title="preview" src="{preview.url}"></iframe>
        </Panel>
      {/if}
      {#if history}
        {#if selectedVersions}
          <Panel width="40%">
            <CompareVersions {language} {translate} versions={selectedVersions} {form} />
          </Panel>
        {/if}
        <Panel width="25%">
          <EditHistory bind:backup bind:item bind:errors bind:selectedVersions user={$user} {api} {entity} {log} {readonly} {language} {translate}  />
        </Panel>
      {/if}
      {#if debug}
        <Panel width="30%">
          <ObjectTree bind:data={item} />
        </Panel>
      {/if}
    </PanelManager>

  {:else}

    <Toolbar large="768">
      <Multifilter
        {moduleName}
        {language}
        {translate}
        {dragdata}
        users={Object.keys($users)}
        options={filters}
        placeholder={translate('Fill in criteria', language)}
        on:submit={submitFilters}
        on:share={e => shareQuery(e, api)}
        bind:this={multifilter}
      />
      {#if user.can(moduleName + '/createFlatpages')}
        <ToolbarButton {icon} on:click={e => openItem(e, true)} title={translate('new', language)} hint={translate('Create new flatpage', language)} />
      {/if}
    </Toolbar>
    <Grid bind:this={grid} {language} {items} {translate} options={gridOptions} bind:dragdata on:select={openItem} />

  {/if}

{/if}

<style>
  :global(.panel>iframe) {
    height: 100%;
    border: 0;
  }
</style>
