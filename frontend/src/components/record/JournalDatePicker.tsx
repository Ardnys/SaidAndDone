import dayjs from "dayjs";
import { useJournalStore } from "../../store";
import { DatePickerInput, type DatePickerProps } from "@mantine/dates";
import { Indicator, Loader } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const JournalDatePicker = () => {
	const { date, setDate } = useJournalStore();

	const [daysWithJournals, setDaysWithJournals] = useState<Set<string>>(
		new Set()
	);

	const [displayedMonth, setDisplayedMonth] = useState(date ? date : null);

	const [isLoading, setIsLoading] = useState(false);

	const dayRenderer: DatePickerProps["renderDay"] = (date) => {
		const dayOfMonth = dayjs(date).date();
		const formattedDate = dayjs(date).format("YYYY-MM-DD");
		const hasJournal = daysWithJournals.has(formattedDate);

		return (
			<Indicator
				size={6}
				color="teal"
				position="bottom-center"
				offset={-2}
				disabled={!hasJournal}
			>
				<div>{dayOfMonth}</div>
			</Indicator>
		);
	};

	const fetchEntryDatesForMonth = useCallback(async (month: string) => {
		setIsLoading(true);
		try {
			const startOfMonth = dayjs(month).startOf("month").format("YYYY-MM-DD");
			const endOfMonth = dayjs(month).endOf("month").format("YYYY-MM-DD");

			const url = `/api/entries_by_date_range?start=${startOfMonth}&end=${endOfMonth}`;
			const response = await axios.get<string[]>(url);

			setDaysWithJournals(
				(prevDays) => new Set([...prevDays, ...response.data])
			);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error(
					"Axios error fetching journal entry dates:",
					error.message
				);
			} else {
				console.error("An unexpected error occurred:", error);
			}
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (displayedMonth) {
			fetchEntryDatesForMonth(displayedMonth);
		}
	}, [displayedMonth, fetchEntryDatesForMonth]);

	return (
		<DatePickerInput
			value={date}
			onChange={setDate}
			onNextMonth={setDisplayedMonth}
			onPreviousMonth={setDisplayedMonth}
			onMonthSelect={setDisplayedMonth}
			renderDay={dayRenderer}
			rightSection={isLoading ? <Loader size="xs" /> : null}
			label="Journal Date"
			placeholder="Select a date"
			valueFormat="YYYY-MM-DD"
		/>
	);
};

export default JournalDatePicker;
