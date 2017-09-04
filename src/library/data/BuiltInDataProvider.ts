import { backend, Text, IDataProvider, TextMode } from "carbon-core";
import { ToolboxConfig, DataStencil } from "../LibraryDefs";

const config: ToolboxConfig<DataStencil> = {
    id: "builtin",
    groups: [
        {
            name: "People",
            items: [
                { title: "Full Name", id: "fullName", examples: ["Jimmy Page", "Robert Plant"] },
                { title: "First Name", id: "firstName", examples: ["Freddy", "Brian"] },
                { title: "Last Name", id: "lastName", examples: ["Gilmour", "Waters"] },
                { title: "Username", id: "username", examples: ["Paul_46", "Ringo-80"] },
                { title: "Title", id: "namePrefix", examples: ["Mr", "Mrs"] },
                { title: "Name Suffix", id: "nameSuffix", examples: ["PhD", "V"] },
                { title: "Email", id: "email", examples: ["brianjohnson@cdca.com", "angus.young@highway.au"] },
            ]
        },
        {
            name: "Business",
            items: [
                { title: "Company Name", id: "companyName", examples: ["Google", "Microsoft"] },
                { title: "Domain Name", id: "domainName", examples: ["google.com", "microsoft.com"] },
                { title: "URL", id: "url", examples: ["https://google.com", "https://microsoft.com"] },
                { title: "Job Title", id: "jobTitle", examples: ["Engineer", "Technician"] },
                { title: "Job Description", id: "jobDescription", examples: ["Dynamic", "Direct"] },
                { title: "Job Area", id: "jobArea", examples: ["Creative", "Optimization"] },
                { title: "Catch Phrase", id: "catchPhrase", examples: ["Persistent monitoring", "Fast solutions"] },
                { title: "Product", id: "product", examples: ["Table", "Chair"] },
                { title: "Product Name", id: "productName", examples: ["Handmade Table", "Small Soap"] },
                { title: "Product Material", id: "productMaterial", examples: ["Cotton", "Wood"] },
                { title: "Product Categories", id: "productCategories", examples: ["Automotive, Engines", "Baby, Soap"] },
                { title: "Product Adjective", id: "productAdjective", examples: ["Small", "Rustic"] },
                { title: "Color", id: "color", examples: ["Pink", "Green"] },
                { title: "Department", id: "department", examples: ["Electronics", "Grocery"] },
                { title: "Phone Number", id: "phoneNumber", examples: ["(735) 347-7090 x625", "1-815-194-4682"] }
            ]
        },
        {
            name: "Money",
            items: [
                { title: "Price", id: "price", examples: ["216.40", "815.00"] },
                { title: "Account", id: "account", examples: ["60654218", "23471997"] },
                { title: "Account Name", id: "accountName", examples: ["Savings Account", "Personal Loan Account"] },
                { title: "BIC", id: "bic", examples: ["CVRUMGW1050", "JOTUCFN1"] },
                { title: "IBAN", id: "iban", examples: ["VG7250U700950", "ES8700220801287"] },
                { title: "Credit Card Number", id: "creditCardNumber", examples: ["4012000077777777", "4009348888881881"] },
                { title: "Transaction Type", id: "transactionType", examples: ["payment", "withdrawal"] },
                { title: "Currency Code", id: "currencyCode", examples: ["USD", "EUR"] },
                { title: "Bitcon", id: "bitcoin", examples: ["369351K02GTI3411G2PEJZ8RH59AR8Q834", "3R36VHL8UVJ8019BHER899D3445"] },
            ]
        },
        {
            name: "Date",
            items: [
                { title: "Date of Birth", id: "dateOfBirth", examples: ["4/27/1950", "8/30/1946"] },
                { title: "Date of Birth Long", id: "dateOfBirthLong", examples: ["Sunday, November 23, 1997", "Sunday, August 29, 1993"] },
                { title: "Future Date", id: "dateFuture", examples: ["4/27/" + (new Date().getFullYear() + 1), "8/30/" + (new Date().getFullYear() + 2)] },
                { title: "Past Date", id: "datePast", examples: ["6/18/2016", "3/16/2016"] },
                { title: "Ago", id: "ago", examples: ["58 seconds ago", "15 minutes ago"] },
                { title: "Time", id: "time", examples: ["23:48", "0:13"] },
                { title: "Time AM", id: "timeAM", examples: ["3:13 AM", "6:35 AM"] },
                { title: "Time PM", id: "timePM", examples: ["3:18 PM", "0:2 PM"] },
                { title: "Year", id: "year", examples: ["1997", "2012"] }
            ]
        },
        {
            name: "Geography",
            items: [
                { title: "Country", id: "country", examples: ["Spain", "Italy"] },
                { title: "State", id: "state", examples: ["Montana", "Texas"] },
                { title: "City", id: "city", examples: ["Moscow", "Berlin"] },
                { title: "ZIP", id: "zipCode", examples: ["75013-9702", "25884"] },
                { title: "Country Code", id: "countryCode", examples: ["USA", "UK"] },
                { title: "Street Address", id: "streetAddress", examples: ["31 Abbey Road", "25 Wall Street"] },
                { title: "Street Name", id: "street", examples: ["Broadway", "Lombard Street"] },
                { title: "Street Number", id: "buildingNumber", examples: ["91 B", "105 C"] },
                { title: "Latitude", id: "latitude", examples: ["-86.3729", "47.7312"] },
                { title: "Longitude", id: "longitude", examples: ["56.4242", "-67.9782"] }
            ]
        },
        {
            name: "Computers",
            items: [
                { title: "Password", id: "password", examples: ["laoaieaaou", "yeioiouioo"] },
                { title: "IP", id: "ip", examples: ["241.157.62.236", "91.95.99.78"] },
                { title: "IPv6", id: "ipv6", examples: ["d27a:95da:83d7:1610:e285:f6ce:5551:752b", "ca97:a82:e06:1872:732d:8bb6:4112:9cfd"] },
                { title: "Protocol", id: "protocol", examples: ["http", "https"] },
                { title: "File Extension", id: "fileExtension", examples: ["mp4", "txt"] },
                { title: "File Name", id: "fileName", examples: ["nice_shirts.png", "customers.txt"] },
                { title: "File Type", id: "fileType", examples: ["audio", "video"] },
                { title: "Mime Type", id: "mimeType", examples: ["application/json", "video/mp4"] },
                { title: "SemVer", id: "semver", examples: ["5.2.4", "0.0.1"] },
                { title: "Version", id: "version", examples: ["9.3.1.3", "6.1.2.7"] },
                { title: "Exception", id: "exception", examples: ["System.FileNotFoundException", "System.NotImplementedException"] },
            ]
        },
        {
            name: "Other",
            items: [
                { title: "Lorem Paragraph", id: "loremParagraph", examples: [] },
                { title: "Lorem Sentence", id: "loremSentence", examples: [] },
                { title: "Number sequence", id: "numberSeq", examples: [1, 2] },
                { title: "Random numbers", id: "numberRand", examples: [53, 14] },
            ]
        }
    ]
};

export default class BuiltInDataProvider implements IDataProvider {
    constructor(public id: string, public name: string) {
    }

    fetch(fields, rowCount) {
        return backend.dataProxy.generate(fields.join(","), rowCount);
    }
    getConfig() {
        return config;
    }
    createElement(app, stencilId) {
        var name = this.findTitle(stencilId);

        var element = new Text();
        element.prepareAndSetProps({
            content: "= " + name,
            font: app.props.defaultTextSettings.font,
            mode: TextMode.Label,
            textStyleId: app.props.defaultTextSettings.textStyleId,
            dp: "builtin",
            df: stencilId
        });
        element.markAsDataField();
        return element;
    }

    private findTitle(id: string): string {
        for (var i = 0; i < config.groups.length; ++i) {
            for (var j = 0; j < config.groups[i].items.length; ++j) {
                var row = config.groups[i].items[j];
                if (row.id === id) {
                    return row.title;
                }
            }
        }
        return "";
    }
}