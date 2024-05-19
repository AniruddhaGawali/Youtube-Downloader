'use client';

import React from 'react';
import { z } from 'zod';
import { CgSpinner } from 'react-icons/cg';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { invoke } from '@tauri-apps/api';

type Props = {
  setLink: (link: string) => void;
  setDetails: (details: VideoDetails) => void;
};

const youtubeUrlRegex = new RegExp(
  '^(https?\\:\\/\\/)?(www\\.)?(youtube\\.com|youtu\\.?be)\\/.+$'
);

const formSchema = z.object({
  link: z
    .string()
    .url({
      message: 'Invalid URL',
    })
    .regex(youtubeUrlRegex, {
      message: 'Invalid Youtube URL',
    }),
});

function LinkForm({ setLink, setDetails }: Props): JSX.Element {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: '',
    },
  });

  function removeDuplicates(array: [], propertyName: string) {
    return array.filter(
      (obj, pos, arr) =>
        arr.map((mapObj) => mapObj[propertyName]).indexOf(obj[propertyName]) ===
        pos
    );
  }

  const getDetails = async (link: string) => {
    setLink(link);
    const res= await invoke<string>('get_audio_and_video_detail', {
      url: link,
    });

    const result: VideoDetails = {
      video: removeDuplicates(JSON.parse(res).video, 'video_quality'),
      audio: removeDuplicates(JSON.parse(res).audio, 'audio_quality'),
    };

    setDetails(result);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (e) => {
          await getDetails(e.link);
        })}
        className="space-y-8 w-full lg:w-2/3 xl:w-1/3 m-10"
      >
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Youtube Video URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="Youtube URL"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the URL of the Youtube video you want to download.
                <br /> Eg: https://www.youtube.com/watch?v=video_id
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {form.formState.isLoading || form.formState.isSubmitting ? (
            <CgSpinner className="animate-spin h-6 w-6 text-white" />
          ) : (
            'Get Details'
          )}
        </Button>
      </form>
    </Form>
  );
}

export default LinkForm;
