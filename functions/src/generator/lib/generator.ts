import * as ejs from 'ejs';
import * as markdownToPDf from 'markdown-pdf';
import * as os from 'os';
import ConventionEn from '../templates/convention_en';

import ConventionFr from '../templates/convention_fr';
import InvoiceEn from '../templates/invoice_en';
import InvoiceFr from '../templates/invoice_fr';
import ProformaInvoiceEn from '../templates/proforma_invoice_en';
import ProformaInvoiceFr from '../templates/proforma_invoice_fr';

const [year, month, day] = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
})
    .format(new Date())
    .split('-');
const DATE = `${day}/${month}/${year}`;

function getSponsoringFees(sponsoring): [string, number, number] {
    switch (sponsoring) {
        case 'Bronze':
            return ['mille euros', 1000, 4];
        case 'Silver':
            return ['deux mille euros', 2000, 6];
        default:
            return ['quatre milles euros', 4000, 10];
    }
}

function generateFile(config, fileName, fileFr, fileEn, settings) {
    const [SPONSORING_TEXT, SPONSORING_NUMBER, NUMBER_PLACE] = getSponsoringFees(config.sponsoring);
    return new Promise((resolve, reject) => {
        const data = {
            COMPANY: config.name,
            SIRET: config.siret,
            COMPANY_ADDRESS: config.address,
            COMPANY_CP: config.zipCode,
            COMPANY_CITY: config.city,
            CONTACT: config.representant,
            ROLE: config.role,
            DEVFEST_EDITION: settings.convention.edition,
            NUMBER_PLACE,
            SPONSORING: config.sponsoring,
            PO: config.PO,
            SPONSORING_TEXT,
            SPONSORING_NUMBER,
            START_DATE: settings.convention.startdate,
            END_DATE: settings.convention.enddate,
            DATE,
            GDG_CP: settings.gdg.zipcode,
            GDG_ADDRESS: settings.gdg.address,
            GDG_CITY: settings.gdg.city,
            INVOICE_NUMBER: config.invoiceNumber
        };
        try {
            console.log('Generator:', 'generate ' + fileName);
            const str = ejs.render(fileFr, data);
            markdownToPDf()
                .from.string(str)
                .to(os.tmpdir() + '/' + fileName, err => {
                    if (err) {
                        console.error(err);
                        throw err
                    }
                    resolve(fileName);
                });
        } catch (e) {
            console.log('Generator:', 'error when generating ' + fileName, e);

            reject(e);
        }
    });
}

export function generateProformaInvoice(config, settings) {
    return generateFile(config, `proforma_invoice_${config.id}.pdf`, ProformaInvoiceFr, ProformaInvoiceEn, settings);
}
export function generateInvoice(config, settings) {
    return generateFile(config, `invoice_${config.id}.pdf`, InvoiceFr, InvoiceEn, settings);
}
export function generateConvention(config, settings) {
    return generateFile(config, `convention_${config.id}.pdf`, ConventionFr, ConventionEn, settings);
}
