import ModalContext from '@/context/ModalContext';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useEffect, useState } from 'react';

import FlashMessageRender from '@/components/FlashMessageRender';
import Field from '@/components/elements/Field';
import FormikSwitch from '@/components/elements/FormikSwitch';
import Switch from '@/components/elements/Switch';
import { Button } from '@/components/elements/button/index';
import ScheduleCheatsheetCards from '@/components/server/schedules/ScheduleCheatsheetCards';

import asModal from '@/hoc/asModal';

import { httpErrorToHuman } from '@/api/http';
import createOrUpdateSchedule from '@/api/server/schedules/createOrUpdateSchedule';
import { Schedule } from '@/api/server/schedules/getServerSchedules';

import { ServerContext } from '@/state/server';

import useFlash from '@/plugins/useFlash';

interface Props {
    schedule?: Schedule;
}

interface Values {
    name: string;
    dayOfWeek: string;
    month: string;
    dayOfMonth: string;
    hour: string;
    minute: string;
    enabled: boolean;
    onlyWhenOnline: boolean;
}

const EditScheduleModal = ({ schedule }: Props) => {
    const { addError, clearFlashes } = useFlash();
    const { dismiss } = useContext(ModalContext);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const appendSchedule = ServerContext.useStoreActions((actions) => actions.schedules.appendSchedule);
    const [showCheatsheet, setShowCheetsheet] = useState(false);

    useEffect(() => {
        return () => {
            clearFlashes('schedule:edit');
        };
    }, []);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('schedule:edit');
        createOrUpdateSchedule(uuid, {
            id: schedule?.id,
            name: values.name,
            cron: {
                minute: values.minute,
                hour: values.hour,
                dayOfWeek: values.dayOfWeek,
                month: values.month,
                dayOfMonth: values.dayOfMonth,
            },
            onlyWhenOnline: values.onlyWhenOnline,
            isActive: values.enabled,
        })
            .then((schedule) => {
                setSubmitting(false);
                appendSchedule(schedule);
                dismiss();
            })
            .catch((error) => {
                console.error(error);

                setSubmitting(false);
                addError({ key: 'schedule:edit', message: httpErrorToHuman(error) });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={
                {
                    name: schedule?.name || '',
                    minute: schedule?.cron.minute || '*/5',
                    hour: schedule?.cron.hour || '*',
                    dayOfMonth: schedule?.cron.dayOfMonth || '*',
                    month: schedule?.cron.month || '*',
                    dayOfWeek: schedule?.cron.dayOfWeek || '*',
                    enabled: schedule?.isActive ?? true,
                    onlyWhenOnline: schedule?.onlyWhenOnline ?? true,
                } as Values
            }
        >
            {({ isSubmitting }) => (
                <Form>
                    <h3 className={`text-2xl mb-6`}>{schedule ? 'Edit schedule' : 'Create new schedule'}</h3>
                    <FlashMessageRender byKey={'schedule:edit'} />
                    <Field
                        name={'name'}
                        label={'Schedule name'}
                        description={'A human readable identifier for this schedule.'}
                    />
                    <div className={`grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6`}>
                        <Field name={'minute'} label={'Minute'} />
                        <Field name={'hour'} label={'Hour'} />
                        <Field name={'dayOfMonth'} label={'Day of month'} />
                        <Field name={'month'} label={'Month'} />
                        <Field name={'dayOfWeek'} label={'Day of week'} />
                    </div>
                    <p className={`text-zinc-400 text-xs mt-2`}>
                        The schedule system supports the use of Cronjob syntax when defining when tasks should begin
                        running. Use the fields above to specify when these tasks should begin running.
                    </p>
                    <div className={`mt-6 bg-[#ffffff11] p-4 rounded-xl`}>
                        <div className={`flex justify-between items-center`}>
                            <div className={`flex flex-col`}>
                                <a className=''>Show Cheatsheet</a>
                                <a className='text-sm text-zinc-400'>Show the cron cheatsheet for some examples.</a>
                            </div>
                            <div onClick={() => setShowCheetsheet((s) => !s)} className={`cursor-pointer pr-2 hover:text-zinc-400`}>
                                <a className='font-thin'>{showCheatsheet ? 'V' : 'Λ'}</a>
                            </div>
                        </div>
                        {showCheatsheet && (
                            <div className={`block md:flex w-full`}>
                                <ScheduleCheatsheetCards />
                            </div>
                        )}
                    </div>
                    <div className={`mt-6 bg-[#ffffff11] p-4 rounded-xl`}>
                        <FormikSwitch
                            name={'onlyWhenOnline'}
                            description={'Only execute this schedule when the server is in a running state.'}
                            label={'Only When Server Is Online'}
                        />
                    </div>
                    <div className={`mt-6 bg-[#ffffff11] p-4 rounded-xl`}>
                        <FormikSwitch
                            name={'enabled'}
                            description={'This schedule will be executed automatically if enabled.'}
                            label={'Schedule Enabled'}
                        />
                    </div>
                    <div className={`mt-6 text-right`}>
                        <Button className={'w-full sm:w-auto'} type={'submit'} disabled={isSubmitting}>
                            {schedule ? 'Save changes' : 'Create schedule'}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default asModal<Props>()(EditScheduleModal);
