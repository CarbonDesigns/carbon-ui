import { Response, IValidatePageNameModel, IPublishPageModel, IValidatePageNameResult, IPublishPageResult, ResourceScope } from "carbon-api";

export type PublishAction =
    {type: "Publish_NameValidation", response: Response<IValidatePageNameModel, IValidatePageNameResult>} |
    {type: "Publish_Published", response: Response<IPublishPageModel, IPublishPageResult>} |
    {type: "Publish_PrivacyChanged", newValue: ResourceScope} |
    {type: "Publish_CoverSelected", coverUrl: string};