export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  number_of_guests: number;
  attendance: "attending" | "not_attending";
  dietary_requirements: string;
  created_at: string;
}

export interface Photo {
  id: string;
  url: string;
  approved: boolean;
  created_at: string;
}

export interface StorySection {
  id: string;
  title: string;
  content: string;
  image: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: string;
}
