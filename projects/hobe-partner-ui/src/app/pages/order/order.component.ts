import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { DateUtils, FormUtils, HintComponent, Item, LoadingComponent, OperatorUtils, Order, OrderService, OrderStatus, OrderStatusUtils, PageHeaderComponent, PaymentMethodTypeUtils, PaymentStatusUtils, PhonePipe, State, StateUtils, ZipCodePipe, TimePipe } from '@hobe/shared';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrl: './order.component.scss',
    imports: [
    ButtonModule,
    CommonModule,
    DatePickerModule,
    FormsModule,
    HintComponent,
    LoadingComponent,
    PageHeaderComponent,
    PhonePipe,
    ReactiveFormsModule,
    SelectModule,
    TextareaModule,
    ZipCodePipe,
    TimePipe
]
})
export class OrderComponent implements OnInit {

    public order!: Order;
    public form!: FormGroup;

    public isLoading: boolean = false;
    public isSubmitting: boolean = false;
    public now: Date = new Date();

    public statusOptions = Object.values(OrderStatus).map(status => ({
        label: OrderStatusUtils.getFriendlyName(status),
        value: status
    }));

    constructor(
        private readonly _activatedRoute: ActivatedRoute,
        private readonly _changeDetector: ChangeDetectorRef,
        private readonly _formBuilder: FormBuilder,
        private readonly _orderService: OrderService,
        private readonly _zipCodePipe: ZipCodePipe
    ) { }

    async ngOnInit(): Promise<void> {
        await this._fetchData();
        this._buildForm();
    }

    getItemAddress(item: Item) {
        const { street, number, neighborhood, complement, city, state, zipCode } = item.serviceAddress;
        let address = `${street}, nº ${number} - ${neighborhood}`;

        if (complement) {
            address += `, ${complement}`;
        }

        address += `, ${city} - ${state}, CEP: ${this._zipCodePipe.transform(zipCode)}`;

        return address;
    }

    getItemPicture(item: Item) {
        const entity = item.product || item.service;
        return entity.pictures.sort((a, b) => a.position - b.position).map(p => p.path)[0];
    }

    getItemName(item: Item) {
        const entity = item.product || item.service;
        return entity.name;
    }

    getErrorMessage(form: FormGroup | FormArray, controlName: string) {
        return FormUtils.getErrorMessage(form, controlName);
    }

    getStateFriendlyName(state: State) {
        return StateUtils.getFriendlyName(state);
    }

    getPaymentMethodTypeFriendlyName(paymentMethodTypeId: any) {
        return PaymentMethodTypeUtils.getFriendlyName(paymentMethodTypeId);
    }

    getPaymentStatusFriendlyName(paymentStatus: any) {
        return PaymentStatusUtils.getFriendlyName(paymentStatus);
    }

    hasError(form: FormGroup | FormArray, controlName: string) {
        return FormUtils.hasError(form, controlName);
    }

    hasCancelationOrTrackingDetails() {
        return this.hasCancelationDetails() || this.hasTrackingDetails();
    }

    hasCancelationDetails() {
        const { cancellationDate, cancellationReason } = this.order;
        return cancellationDate || cancellationReason;
    }

    hasTrackingDetails() {
        const { carrier, trackingNumber, trackingLink, deliveryEstimate } = this.order;
        return carrier || trackingNumber || trackingLink || deliveryEstimate;
    }

    hasPaymentDatails() {
        if (!this.order.payment) return
        return this.order.payment.mercadoPagoPaymentId ? true : false
    }

    handleStatusChange({ value }: any) {

        Object.keys(this.form.controls).forEach(controlName => {
            this.form.get(controlName)?.clearValidators();
            this.form.get(controlName)?.updateValueAndValidity();
        });

        if (value === OrderStatus.SHIPPED) {
            this.form.get('carrier')?.addValidators(Validators.required);
            this.form.get('trackingNumber')?.addValidators(Validators.required);
            this.form.get('trackingLink')?.addValidators(Validators.required);
            this.form.get('deliveryEstimate')?.addValidators(Validators.required);
        }

        if (value === OrderStatus.DELIVERED) {
            this.form.get('deliveredDate')?.addValidators(Validators.required);
            this.form.get('deliveredTime')?.addValidators(Validators.required);
        }

        if (value === OrderStatus.CANCELED) {
            this.form.get('cancellationDate')?.patchValue(new Date());
            this.form.get('cancellationDate')?.addValidators(Validators.required);
            this.form.get('cancellationReason')?.addValidators(Validators.required);
        } else {
            this.form.get('cancellationDate')?.patchValue(undefined);
        }
    }

    isPending() {
        return this.form.get('status')?.value === OrderStatus.WAITING_PAYMENT;
    }

    isCanceled() {
        return this.form.get('status')?.value === OrderStatus.CANCELED;
    }

    isDelivered() {
        return this.form.get('status')?.value === OrderStatus.DELIVERED;
    }

    isShipped() {
        return this.form.get('status')?.value === OrderStatus.SHIPPED;
    }

    async onSubmit() {

        if (this.form.valid) {

            this.isSubmitting = true;
            await OperatorUtils.delay(500);

            const order: Order = { ...this.order, ...this.form.getRawValue() };
            order.deliveredTime = this._getDeliveredTime(order.deliveredTime);

            try {
                this.order = await this._orderService.update(order);
            } finally {
                this.isSubmitting = false;
            }
        } else {
            FormUtils.markAsTouched(this.form);
            FormUtils.goToInvalidFields();
        }
    }

    shouldRenderTrackingDetails() {
        const { status, carrier, trackingNumber, trackingLink, deliveryEstimate } = this.order;
        return status === OrderStatus.SHIPPED || carrier || trackingNumber || trackingLink || deliveryEstimate;
    }

    shouldRenderCancellationDetails() {
        const { status, cancellationDate, cancellationReason } = this.order;
        return status === OrderStatus.CANCELED || cancellationDate || cancellationReason;
    }

    private _buildForm() {

        const deliveryEstimate = this.order.deliveryEstimate ? `${this.order.deliveryEstimate}T00:00:00` : null;
        const deliveredDate = this.order.deliveredDate ? `${this.order.deliveredDate}T00:00:00` : null;
        const deliveredTime = this.order.deliveredTime ? `${this.order.deliveredDate}T${this.order.deliveredTime}` : null;
        const cancellationDate = this.order.cancellationDate ? `${this.order.cancellationDate}T00:00:00` : null;

        this.form = this._formBuilder.group({
            status: [this.order.status, Validators.required],
            carrier: [this.order.carrier, Validators.nullValidator],
            trackingNumber: [this.order.trackingNumber, Validators.nullValidator],
            trackingLink: [this.order.trackingLink, Validators.nullValidator],
            deliveryEstimate: [deliveryEstimate ? new Date(deliveryEstimate) : null, Validators.nullValidator],
            deliveredDate: [deliveredDate ? new Date(deliveredDate) : null, Validators.nullValidator],
            deliveredTime: [deliveredTime ? DateUtils.toLocalDate(deliveredTime) : null, Validators.nullValidator],
            cancellationDate: [cancellationDate ? new Date(cancellationDate) : null, Validators.nullValidator],
            cancellationReason: [this.order.cancellationReason, Validators.nullValidator]
        });
    }

    private _getDeliveredTime(deliveredTime: string) {

        if (deliveredTime) {
            const date = new Date(deliveredTime);
            return date.toISOString().split('T')[1].split('.')[0];
        }

        return undefined as any;
    }

    private async _fetchData() {

        this.isLoading = true;
        await OperatorUtils.delay(500);

        try {
            const id = this._activatedRoute.snapshot.params["id"];
            this.order = await this._orderService.findById(id);
        } finally {
            this._changeDetector.markForCheck();
            this.isLoading = false;
        }
    }
}
