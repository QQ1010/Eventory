export class Event {
    id;
    userId;
    type;
    title;
    content;
    tags;
    source;
    occurredAt;
    createdAt;
    updatedAt;
    metadata;
    constructor(props) {
        if (props.id !== undefined) {
            this.id = props.id;
        }
        this.userId = props.userId;
        this.type = props.type;
        this.title = props.title;
        this.content = props.content;
        this.tags = props.tags;
        this.source = props.source;
        this.occurredAt = props.occurredAt;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.metadata = props.metadata;
    }
}
;
//# sourceMappingURL=event.model.js.map