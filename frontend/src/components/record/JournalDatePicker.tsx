import dayjs from "dayjs";
import { useJournalStore } from "../../store";
import { DatePickerInput, type DatePickerProps } from "@mantine/dates";
import { Indicator } from "@mantine/core";
import { useEffect, useState } from "react";
import axios from "axios";
import type { ApiEntry } from "../journal/Entries";

const JournalDatePicker = () => {
	const { date, setDate } = useJournalStore();
	const [daysWithJournals, setDaysWithJournals] = useState<Set<string>>(
		new Set()
	);

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

	const fetchEntryDates = async () => {
		try {
			const url = `/api/entries_range?start=0&end=10`;
			const response = await axios.get<ApiEntry[]>(url);

			const journalDays: string[] = response.data.map((item) => {
				return item.date;
			});

			setDaysWithJournals(new Set(journalDays));
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error(
					"Axios error fetching journal entry dates:",
					error.message
				);
			} else {
				console.error("An unexpected error occurred:", error);
			}
		}
	};

	useEffect(() => {
		fetchEntryDates();
	}, []);

	return (
		<DatePickerInput value={date} onChange={setDate} renderDay={dayRenderer} />
	);
};

export default JournalDatePicker;
