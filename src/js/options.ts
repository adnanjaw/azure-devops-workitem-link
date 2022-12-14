import $ from 'jquery';
import {StorageService} from "./service/storage-service";
import {DynamicLink} from "./model/DynamicLink";
import {Link} from "./model/Link";

const storageService = new StorageService();

const options: any = {
    'dynamicLinkCollection': [],
    'staticLinkCollection': []
};

function setUpTabsNavbar() {
    $('.card').hide();
    $('.card:first').show();
    $('#tabs div a:first').addClass('active');
    $('#tabs div:not(:first)').addClass('inactive');
    $('#tabs div').on('click', function () {
        const tab = $(this).attr('id');
        if ($(this).hasClass('inactive')) {
            $('#tabs div').addClass('inactive');

            $('#tabs div a').removeClass('active');

            $(this).removeClass('inactive');
            $(this).find('a').addClass('active');

            $('.card').hide();
            $('#' + tab + '-container').fadeIn('slow');
        }
    });
}

$(window).on("load", async function () {

    setUpTabsNavbar();

    await setOptionsPageTitle();

    await refreshTables();

    $(document).on('submit', '#dynamic-link-form', async function () {
        await getOptionsFromStorageAsync;

        const dynamicLink = new DynamicLink(
            String($('#dynamic-link-name').val()),
            String($('#dynamic-link-url').val()),
            String($('#dynamic-azure-planning-field-title').val())
        ).serialize();

        options.dynamicLinkCollection.push(dynamicLink);

        await storageService.setStorageKey({'dynamicLinkCollection': options.dynamicLinkCollection})

        await refreshTables();
    });

    $(document).on('submit', '#static-link-form', async function () {
        await getOptionsFromStorageAsync;

        let staticLink = new Link(
            String($('#static-link-name').val()),
            String($('#static-link-url').val())
        ).serialize()

        options.staticLinkCollection.push(staticLink);

        await storageService.setStorageKey({'staticLinkCollection': options.staticLinkCollection})

        await refreshTables();
    });

    $(document).on('click', '.deleteDynamicLink', function () {
        deleteDynamicLink($(this).data('id'));
    });

    $(document).on('click', '.deleteStaticLink', function () {
        deleteStaticLink($(this).data('id'));
    });
});

function addDynamicLinkRow(index: number, dynamicLink: DynamicLink) {
    $('#dynamic-link-table').append(`<tr id="id-${++index}">
                <th scope="row">${index}</th>
                <td>${dynamicLink.name}</td>
                <td>${dynamicLink.url}</td>
                <td>${dynamicLink.azureFieldName}</td>
                <td>
                    <button type="button" class="btn btn-outline-danger deleteDynamicLink" data-id="${index - 1}">Delete</button>
                </td>
            </tr>`);
}

async function getDynamicLinksCollectionAsync() {
    $("#dynamic-link-table").empty();
    $.each(options.dynamicLinkCollection, function (index: number, dynamicLink) {
        addDynamicLinkRow(index, DynamicLink.fromSerialized(dynamicLink));
    });
}

async function getStaticLinksCollectionAsync() {
    $("#static-link-table").empty();
    $.each(options.staticLinkCollection, function (index: number, staticLink) {
        addStaticLinkRow(index, Link.fromSerialized(staticLink));
    });
}

function addStaticLinkRow(index: number, staticLink: any) {
    $('#static-link-table').append(`<tr id="id-${++index}">
                <th scope="row">${index}</th>
                <td>${staticLink.name}</td>
                <td>${staticLink.url}</td>
                <td>
                    <button type="button" class="btn btn-outline-danger deleteStaticLink" data-id="${index - 1}">Delete</button>
                </td>
            </tr>`);
}

async function refreshTables() {
    await getOptionsFromStorageAsync;

    await getDynamicLinksCollectionAsync();

    await getStaticLinksCollectionAsync();
}

async function deleteDynamicLink(id: number) {
    await getOptionsFromStorageAsync;

    options.dynamicLinkCollection.forEach((element: DynamicLink, index: number) => {
        if (index === id) options.dynamicLinkCollection.splice(index, 1);
    });

    await storageService.setStorageKey({'dynamicLinkCollection': options.dynamicLinkCollection})

    await refreshTables();
}

async function deleteStaticLink(id: number) {
    await getOptionsFromStorageAsync;

    options.staticLinkCollection.forEach((element: DynamicLink, index: number) => {
        if (index === id) options.staticLinkCollection.splice(index, 1);
    });

    await storageService.setStorageKey({'staticLinkCollection': options.staticLinkCollection})

    await refreshTables();
}

async function setOptionsPageTitle() {
    const manifestData = chrome.runtime.getManifest();
    $('#option-page-title').text('Add Options: (v' + manifestData.version + ')');
}

const getOptionsFromStorageAsync = storageService.getAllStorageLocalData().then(storageOptions => {
    Object.assign(options, storageOptions);
});