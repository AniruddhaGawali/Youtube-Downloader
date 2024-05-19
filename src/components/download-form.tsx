'use client';

import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CgSpinner } from 'react-icons/cg';
import { open } from '@tauri-apps/api/dialog';

import { invoke } from '@tauri-apps/api';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Button } from '@/components/ui/button';

type Props = {
  details: VideoDetails | null;
  link: string;
};

const FormSchema = z.object({
  videoQuality: z
    .string({
      required_error: 'Please select a video quality',
    })
    .min(1, {
      message: 'Please select a video quality',
    }),

  audioQuality: z
    .string({
      required_error: 'Please select a audio quality',
    })
    .min(1, {
      message: 'Please select a audio quality',
    }),
});

function DownloadForm({ details, link }: Props) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      videoQuality: '',
      audioQuality: '',
    },
  });

  const download_video = async (
    data: {
      videoQuality: string;
      audioQuality: string;
    },
    path: string
  ) => {
    const res = await invoke<string>('download_video', {
      url: link,
      videoOption: data.videoQuality.toString(),
      audioOption: data.audioQuality.toString(),
      path: path,
    });
  };

  if (!details) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center w-full lg:w-2/3 xl:w-1/3">
      <h2 className="text-3xl text-gray-800 font-bold my-5 ">
        Download Options
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (e) => {
            const result = await open({
              directory: true,
              multiple: false,
              title: 'Select Directory',
              filters: [{ name: 'All Files', extensions: ['*'] }],
              defaultPath: '/',
              recursive: false,
            });
            if (result && !Array.isArray(result) && result.length > 0) {
              await download_video(e, result);
            }
          })}
          className="space-y-8 flex flex-col w-full items-center justify-center"
        >
          <FormField
            control={form.control}
            name="videoQuality"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Video Quality</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Video Quality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {details?.video.map((video) => (
                      <SelectItem
                        key={video.video_quality}
                        value={video.video_quality}
                      >
                        {video.video_quality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the video quality you want to download.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="audioQuality"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Audio Quality</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Audio Quality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {details?.audio.map((audio) => (
                      <SelectItem
                        key={audio.audio_quality}
                        value={audio.audio_quality}
                      >
                        {audio.audio_quality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the audio quality you want to download.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 
          

          {/* <Button
          type='button'
            className="w-1/2 justify-center self-center m-auto"
            onClick={async () => {
              const result = await open({
                directory: true,
              });

              console.log(result);

              // if (result) {
              //   form.setValue('dirPath', result);
              // }
            }}
          >
            Select Directory
          </Button> */}

          <Button
            className="w-1/2 justify-center self-center m-auto"
            type="submit"
          >
            {form.formState.isLoading || form.formState.isSubmitting ? (
              <CgSpinner className="animate-spin h-6 w-6 text-white" />
            ) : (
              'Download'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default DownloadForm;
