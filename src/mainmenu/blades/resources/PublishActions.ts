import { Response, IValidatePageNameModel, IPublishPageModel, IValidatePageNameResult, IPublishPageResult, PublishScope } from "carbon-api";

export type PublishAction =
    {type: "Publish_NameValidation", response: Response<IValidatePageNameModel, IValidatePageNameResult>} |
    {type: "Publish_Published", response: Response<IPublishPageModel, IPublishPageResult>} |
    {type: "Publish_PrivacyChanged", newValue: PublishScope} |
    {type: "Publish_CoverSelected", coverUrl: string};